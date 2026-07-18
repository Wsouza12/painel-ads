import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ab = searchParams.get("ab");
    const parent_id = searchParams.get("parent_id"); // Para Variant B saber de quem é filho

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const { data: product } = await supabaseAdmin
      .from("ml_products")
      .select("*")
      .eq("ml_item_id", id)
      .single();

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    let title = product.custom_title || product.original_title;
    let price = product.custom_price || product.original_price;
    const imageUrl = product.original_image_url;

    // Se estiver renderizando para um teste A/B
    if (ab === "A") {
      const { data: abTest } = await supabaseAdmin.from("ml_ab_tests").select("*").eq("product_id", product.id).eq("status", "running").maybeSingle();
      if (abTest) {
        title = abTest.variant_a_title || title;
      }
    } else if (ab === "B" && parent_id) {
      // Para a variante B, buscamos o teste onde o product_id pai = parent_id
      const { data: parentProduct } = await supabaseAdmin.from("ml_products").select("id").eq("ml_item_id", parent_id).single();
      if (parentProduct) {
        const { data: abTest } = await supabaseAdmin.from("ml_ab_tests").select("*").eq("product_id", parentProduct.id).eq("status", "running").maybeSingle();
        if (abTest) {
          title = abTest.variant_b_title || title;
        }
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            position: "relative",
          }}
        >
          {/* Fundo do produto */}
          <img
            src={imageUrl}
            alt="Product"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
            }}
          />

          {/* Tarja de OFERTA */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 40,
              left: -80,
              background: "#ff0000",
              color: "white",
              padding: "20px 100px",
              fontSize: 60,
              fontWeight: "bold",
              transform: "rotate(-45deg)",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              fontFamily: "sans-serif",
            }}
          >
            OFERTA
          </div>

          {/* Rodapé com Preço */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
              flexDirection: "column",
              padding: "40px",
              paddingTop: "100px",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "white",
                fontSize: 48,
                fontWeight: "bold",
                marginBottom: 10,
                lineHeight: 1.2,
                fontFamily: "sans-serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                color: "#ffd700",
                fontSize: 80,
                fontWeight: "900",
                fontFamily: "sans-serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              R$ {Number(price).toFixed(2).replace(".", ",")}
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
          "CDN-Cache-Control": "no-store, no-cache",
          "Vercel-CDN-Cache-Control": "no-store",
          "Netlify-CDN-Cache-Control": "no-store",
        }
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
