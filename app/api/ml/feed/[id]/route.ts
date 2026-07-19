import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toMetaRow, toCsv } from "@/lib/meta-feed";
import { getDescription } from "@/lib/ml";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : 0;
    const isBridge = searchParams.get("bridge") === "true";
    
    // Buscar conexão
    const { data: connection } = await supabaseAdmin
      .from("ml_connections")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!connection) {
      return new Response("Connection not found", { status: 404 });
    }

    // Buscar produtos da DB - apenas ativos no ML (não pausados)
    let query = supabaseAdmin
      .from("ml_products")
      .select("*")
      .eq("connection_id", connection.id)
      .eq("is_active", true)
      .neq("original_condition", "paused");

    const { data: products } = await query;
    if (!products || products.length === 0) return new Response("No products", { status: 404 });

    const rows = [];
    
    // VERCEL_URL returns the deployment URL which changes on every deploy.
    // We should use the project domain.
    let appUrl = "https://painel-ads-one.vercel.app";

    for (const product of products) {
      // Aplicar filtro de preço mínimo
      const finalPrice = product.custom_price || product.original_price;
      if (finalPrice < minPrice) continue;

      const permalink = isBridge 
        ? `${appUrl}/p/${product.id}` 
        : product.original_permalink;

      // Montar objeto fake de MlItem para reaproveitar a lógica
      const fakeItem: any = {
        id: product.ml_item_id,
        title: product.original_title,
        price: product.original_price,
        status: product.original_condition === "paused" ? "paused" : "active",
        available_quantity: 1, // Assume disponível se está no DB como ativo
        condition: product.original_condition === "paused" ? "new" : product.original_condition,
        permalink: permalink,
        pictures: [{ secure_url: product.original_image_url }],
        thumbnail: product.original_image_url,
      };

      // Buscar teste A/B ativo para este produto
      const { data: abTest } = await supabaseAdmin
        .from("ml_ab_tests")
        .select("*")
        .eq("product_id", product.id)
        .eq("status", "running")
        .maybeSingle();

      const description = product.original_title; 

      if (abTest) {
        // Função auxiliar para ignorar placehold.co
        const getValidImage = (url: string | null) => {
          if (url && url.includes("placehold.co")) return null;
          return url;
        };

        // Variante A
        rows.push(toMetaRow({
          ...fakeItem,
          id: `${product.ml_item_id}-A`,
        }, description, {
          title: abTest.variant_a_title,
          image_url: getValidImage(abTest.variant_a_image) || product.custom_image_url || product.original_image_url
        }, { item_group_id: product.ml_item_id }));

        // Buscar preco real do Variant B se existir
        let variantBPrice = product.original_price;
        if (abTest.variant_b_product_id) {
          const variantBProduct = products.find((p: any) => p.id === abTest.variant_b_product_id);
          if (variantBProduct) {
            variantBPrice = variantBProduct.custom_price || variantBProduct.original_price;
          }
        }

        // Variante B
        rows.push(toMetaRow({
          ...fakeItem,
          id: `${product.ml_item_id}-B`,
        }, description, {
          title: abTest.variant_b_title,
          image_url: getValidImage(abTest.variant_b_image) || product.original_image_url,
          price: variantBPrice
        }, { item_group_id: product.ml_item_id }));
      } else {
        // Produto normal
        const overrides = {
          title: product.custom_title,
          price: product.custom_price,
          image_url: product.custom_image_url || product.original_image_url,
        };
        rows.push(toMetaRow(fakeItem, description, overrides));
      }
    }

    const csvContent = toCsv(rows);

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="feed-${params.id}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
