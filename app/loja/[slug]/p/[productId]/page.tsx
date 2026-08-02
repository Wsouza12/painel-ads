import { supabaseAdmin } from "@/lib/supabase";
import { getDescription } from "@/lib/ml";
import { notFound } from "next/navigation";
import StoreProductClient from "./StoreProductClient";

export const dynamic = "force-dynamic";

export default async function StoreProductPage({ 
  params,
  searchParams 
}: { 
  params: { slug: string; productId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. Fetch product
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.productId);
  
  let product = null;
  if (isUuid) {
    const { data } = await supabaseAdmin.from("ml_products").select("*").eq("id", params.productId).maybeSingle();
    product = data;
  }
  
  if (!product) {
    const { data } = await supabaseAdmin.from("ml_products").select("*").eq("ml_item_id", params.productId).limit(1);
    if (data && data.length > 0) {
      product = data[0];
    }
  }

  if (!product) {
    return notFound();
  }

  // 2. Fetch Description
  let description = "";
  try {
    const fetchedDesc = await getDescription(product.ml_item_id);
    if (fetchedDesc) {
      description = fetchedDesc.length > 500 ? fetchedDesc.substring(0, 500) + "..." : fetchedDesc;
    }
  } catch (e) {
    console.warn("Desc err:", e);
  }

  const title = product.custom_title || product.original_title;
  const price = product.custom_price || product.original_price;
  const oldPrice = price * 1.25;
  const imageUrl = product.custom_image_url || product.original_image_url;
  const videoUrl = product.custom_video_url || product.custom_video_url_square;

  return (
    <StoreProductClient 
      slug={params.slug}
      product={{
        id: product.id,
        ml_item_id: product.ml_item_id,
        title,
        price,
        oldPrice,
        imageUrl,
        videoUrl,
        description,
        permalink: product.original_permalink,
        connection_id: product.connection_id
      }}
      searchParams={searchParams}
    />
  );
}
