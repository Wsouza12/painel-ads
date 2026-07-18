import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toMetaRow, toCsv } from "@/lib/meta-feed";
import { getDescription } from "@/lib/ml";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : 0;
    
    // Buscar conexão
    const { data: connection } = await supabaseAdmin
      .from("ml_connections")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!connection) {
      return new Response("Connection not found", { status: 404 });
    }

    // Buscar produtos da DB
    let query = supabaseAdmin
      .from("ml_products")
      .select("*")
      .eq("connection_id", connection.id)
      .eq("is_active", true);

    const { data: products } = await query;
    if (!products) return new Response("No products", { status: 404 });

    const rows = [];
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.URL;
    if (process.env.VERCEL_URL) appUrl = `https://${process.env.VERCEL_URL}`;
    if (!appUrl) appUrl = "https://painel-ads.vercel.app";

    for (const product of products) {
      // Aplicar filtro de preço mínimo
      const finalPrice = product.custom_price || product.original_price;
      if (finalPrice < minPrice) continue;

      // Montar objeto fake de MlItem para reaproveitar a lógica
      const fakeItem: any = {
        id: product.ml_item_id,
        title: product.original_title,
        price: product.original_price,
        available_quantity: 1, // Assume disponível se está no DB como ativo
        condition: product.original_condition,
        permalink: product.original_permalink,
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
        // Variante A
        rows.push(toMetaRow({
          ...fakeItem,
          id: `${product.ml_item_id}-A`,
        }, description, {
          title: abTest.variant_a_title,
          image_url: abTest.variant_a_image || product.custom_image_url || product.original_image_url
        }));

        // Variante B
        rows.push(toMetaRow({
          ...fakeItem,
          id: `${product.ml_item_id}-B`,
        }, description, {
          title: abTest.variant_b_title,
          image_url: abTest.variant_b_image || product.original_image_url
        }));
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
