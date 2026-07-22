import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toMetaRow, toCsv } from "@/lib/meta-feed";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const isBridge = searchParams.get("bridge") === "true";
    
    // Buscar produto específico da DB
    const { data: product } = await supabaseAdmin
      .from("ml_products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    const rows = [];
    
    // VERCEL_URL returns the deployment URL which changes on every deploy.
    // We should use the project domain.
    let appUrl = "https://painel-ads-one.vercel.app";

    const permalink = isBridge 
      ? `${appUrl}/p/${product.id}` 
      : product.original_permalink;

    // Montar objeto fake de MlItem para reaproveitar a lógica
    const fakeItem: any = {
      id: product.ml_item_id,
      title: product.original_title,
      price: product.original_price,
      status: product.original_condition === "paused" ? "paused" : "active",
      available_quantity: 1, // Assume disponível se está no DB
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
        image_url: product.custom_image_url || getValidImage(abTest.variant_a_image) || product.original_image_url
      }, { item_group_id: product.ml_item_id }));

      // Buscar preco real e imagem do Variant B se existir
      let variantBPrice = product.original_price;
      let variantBImage = getValidImage(abTest.variant_b_image);

      if (abTest.variant_b_product_id) {
        const { data: variantBProduct } = await supabaseAdmin
          .from("ml_products")
          .select("*")
          .eq("id", abTest.variant_b_product_id)
          .single();
          
        if (variantBProduct) {
          variantBPrice = variantBProduct.custom_price || variantBProduct.original_price;
          if (variantBProduct.custom_image_url) {
            variantBImage = variantBProduct.custom_image_url;
          }
        }
      }

      // Variante B
      rows.push(toMetaRow({
        ...fakeItem,
        id: `${product.ml_item_id}-B`,
      }, description, {
        title: abTest.variant_b_title,
        image_url: variantBImage || product.original_image_url,
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

    const csvContent = toCsv(rows);

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="single-feed-${product.ml_item_id}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
