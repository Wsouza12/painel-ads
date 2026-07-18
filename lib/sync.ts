import { supabaseAdmin } from "./supabase";
import { refreshAccessToken, getAllItemIds, getItemsDetails, getDescription } from "./ml";
import { toMetaRow, toCsv } from "./meta-feed";

const BUCKET = "meta-catalog-feed";

export async function syncAllConnections(userId?: string) {
  let query = supabaseAdmin.from("ml_connections").select("*");
  if (userId) {
    query = query.eq("user_id", userId);
  }
  
  const { data: connections, error } = await query;
  if (error) throw new Error(error.message);
  if (!connections?.length) return [];

  const results = [];
  for (const connection of connections) {
    try {
      const result = await syncOneConnection(connection);
      results.push({ connection_id: connection.id, ...result });
    } catch (err: any) {
      await supabaseAdmin.from("sync_logs").insert({
        connection_id: connection.id,
        status: "error",
        error_message: err.message,
      });
      results.push({ connection_id: connection.id, status: "error", error: err.message });
    }
  }
  return results;
}

async function syncOneConnection(connection: any) {
  const { accessToken, userId } = await refreshAccessToken(connection);

  const ids = await getAllItemIds(connection.ml_user_id ?? userId, accessToken);
  const items = await getItemsDetails(ids, accessToken);

  const rows = [];
  for (const item of items) {
    const originalImageUrl = item.pictures?.[0]?.secure_url || item.thumbnail;
    
    // Check if product exists
    const { data: existing } = await supabaseAdmin
      .from("ml_products")
      .select("*")
      .eq("connection_id", connection.id)
      .eq("ml_item_id", item.id)
      .single();

    if (!existing) {
      await supabaseAdmin.from("ml_products").insert({
        connection_id: connection.id,
        user_id: connection.user_id,
        ml_item_id: item.id,
        original_title: item.title,
        original_price: item.price,
        original_image_url: originalImageUrl,
        original_permalink: item.permalink,
        original_condition: item.status !== "active" ? "paused" : item.condition,
      });
    } else {
      await supabaseAdmin.from("ml_products").update({
        original_title: item.title,
        original_price: item.price,
        original_image_url: originalImageUrl,
        original_permalink: item.permalink,
        original_condition: item.status !== "active" ? "paused" : item.condition,
        updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    }

    const description = await getDescription(item.id, accessToken);
    // Vercel / Netlify URL handling
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.URL;
    if (process.env.VERCEL_URL) appUrl = `https://${process.env.VERCEL_URL}`;
    if (!appUrl) appUrl = "https://painel-ads.vercel.app";
    
    const cacheBuster = existing?.updated_at ? new Date(existing.updated_at).getTime() : Date.now();
    const ogImageUrl = `${appUrl}/api/og/product?id=${item.id}&t=${cacheBuster}`;

    const overrides = existing ? {
      title: existing.custom_title,
      price: existing.custom_price,
      // Se não houver custom_image_url, usamos a imagem gerada pelo Next.js (OG)
      image_url: existing.custom_image_url || ogImageUrl
    } : {
      image_url: ogImageUrl
    };
    
    // Check if this product has an active A/B test
    let abTest = null;
    if (existing) {
      const { data } = await supabaseAdmin
        .from("ml_ab_tests")
        .select("*")
        .eq("product_id", existing.id)
        .eq("status", "running")
        .maybeSingle();
      abTest = data;
    }

    if (abTest && existing) {
      // It's an A/B test! We need to push 2 rows instead of 1.
      
      // Fetch the secondary product (Variant B)
      const { data: variantBProduct } = await supabaseAdmin
        .from("ml_products")
        .select("*")
        .eq("id", abTest.variant_b_product_id)
        .single();
        
      if (variantBProduct) {
        // Row A
        const ogImageA = `${appUrl}/api/og/product?id=${item.id}&ab=A&t=${cacheBuster}`;
        rows.push(toMetaRow(item, abTest.variant_a_desc || description, {
          title: abTest.variant_a_title,
          price: existing.custom_price || existing.original_price, // Usa o preço real do produto A
          image_url: existing.custom_image_url || ogImageA
        }, { id_suffix: "-A", item_group_id: item.id }));

        // Row B
        const cacheBusterB = variantBProduct.updated_at ? new Date(variantBProduct.updated_at).getTime() : Date.now();
        const ogImageB = `${appUrl}/api/og/product?id=${variantBProduct.ml_item_id}&ab=B&parent_id=${item.id}&t=${cacheBusterB}`;
        
        // Mock a temporary item for Variant B using its real DB data
        const itemB = {
          ...item,
          id: variantBProduct.ml_item_id,
          permalink: variantBProduct.original_permalink,
          price: variantBProduct.original_price,
          pictures: [{ secure_url: variantBProduct.original_image_url }]
        };

        rows.push(toMetaRow(itemB as any, abTest.variant_b_desc || description, {
          title: abTest.variant_b_title,
          price: variantBProduct.custom_price || variantBProduct.original_price, // Usa o preço real do produto B
          image_url: variantBProduct.custom_image_url || ogImageB
        }, { id_suffix: "-B", item_group_id: item.id }));
        
        continue; // Skip the normal push
      }
    }

    rows.push(toMetaRow(item, description, overrides));
  }

  // --- Limpeza de Anúncios Pausados ---
  // Produtos que estão no nosso DB mas não vieram na busca do ML (porque foram pausados)
  const activeIds = new Set(items.map((i) => i.id));
  const { data: dbProducts } = await supabaseAdmin
    .from("ml_products")
    .select("*")
    .eq("connection_id", connection.id);

  if (dbProducts) {
    for (const dbProduct of dbProducts) {
      if (!activeIds.has(dbProduct.ml_item_id)) {
        // Marca como pausado no DB para a interface saber
        if (dbProduct.original_condition !== "paused") {
          await supabaseAdmin
            .from("ml_products")
            .update({ original_condition: "paused" })
            .eq("id", dbProduct.id);
        }

        // Adiciona no feed como Esgotado para o Facebook pausar os anúncios
        rows.push({
          id: dbProduct.ml_item_id,
          item_group_id: dbProduct.ml_item_id,
          title: dbProduct.custom_title || dbProduct.original_title,
          description: dbProduct.custom_title || dbProduct.original_title,
          availability: "out of stock",
          condition: "new",
          price: `${Number(dbProduct.custom_price || dbProduct.original_price).toFixed(2)} BRL`,
          link: dbProduct.original_permalink,
          image_link: dbProduct.custom_image_url || dbProduct.original_image_url || `${appUrl}/placeholder.jpg`,
          additional_image_link: "",
          brand: "Genérico",
        });
      }
    }
  }

  const csvContent = toCsv(rows);
  const fileName = `feed-${connection.id}.csv`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, csvContent, { contentType: "text/csv", upsert: true });
  if (uploadError) throw new Error(`Upload falhou: ${uploadError.message}`);

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
  const feedUrl = publicUrlData.publicUrl;

  await supabaseAdmin
    .from("ml_connections")
    .update({ feed_url: feedUrl, updated_at: new Date().toISOString() })
    .eq("id", connection.id);

  await supabaseAdmin.from("sync_logs").insert({
    connection_id: connection.id,
    status: "success",
    products_count: rows.length,
    feed_url: feedUrl,
  });

  return { status: "success", products_count: rows.length, feed_url: feedUrl };
}
