import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ 
  params,
  searchParams 
}: { 
  params: { productId: string };
  searchParams: { slug?: string };
}) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.productId);
  
  let product = null;
  if (isUuid) {
    const { data } = await supabaseAdmin.from("ml_products").select("*").eq("id", params.productId).maybeSingle();
    product = data;
  } else {
    const { data } = await supabaseAdmin.from("ml_products").select("*").eq("ml_item_id", params.productId).limit(1);
    if (data && data.length > 0) {
      product = data[0];
    }
  }

  if (!product) {
    return notFound();
  }

  const title = product.custom_title || product.original_title;
  const price = product.custom_price || product.original_price;
  const imageUrl = product.custom_image_url || product.original_image_url;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-xl text-slate-800">Checkout Seguro</h1>
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ambiente Seguro
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        <CheckoutClient 
          product={{
            id: product.id,
            ml_item_id: product.ml_item_id,
            title,
            price,
            imageUrl
          }}
          storeSlug={searchParams.slug || "oficial"}
        />
      </main>
    </div>
  );
}
