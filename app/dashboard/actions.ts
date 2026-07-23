"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import { syncAllConnections } from "@/lib/sync";

export async function updateProduct(productId: string, formData: FormData) {
  const supabaseAuth = createClient();
  const custom_title = formData.get("custom_title")?.toString() || null;
  const custom_price = formData.get("custom_price") ? Number(formData.get("custom_price")) : null;
  const custom_image_url = formData.get("custom_image_url")?.toString() || null;
  const custom_video_url = formData.get("custom_video_url")?.toString() || null;

  const { error } = await supabaseAuth
    .from("ml_products")
    .update({
      custom_title,
      custom_price,
      custom_image_url,
      custom_video_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  // Trigger sync so the feed is regenerated immediately
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (user) {
    await syncAllConnections(user.id).catch(console.error);
  }

  revalidatePath("/dashboard");
}

export async function savePixelId(connectionId: string, formData: FormData) {
  const pixelId = formData.get("pixelId")?.toString();
  if (!pixelId) return;

  const { error } = await supabaseAdmin
    .from("ml_connections")
    .update({ meta_pixel_id: pixelId })
    .eq("id", connectionId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("image") as File;
  if (!file) throw new Error("Nenhum arquivo recebido.");

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabaseAdmin.storage
    .from("meta-catalog-feed")
    .upload(filePath, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    throw new Error(`Erro no upload: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("meta-catalog-feed")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function generateVideoUploadUrl(fileExt: string) {
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/videos/${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from("meta-catalog-feed")
    .createSignedUploadUrl(filePath);

  if (error || !data) {
    throw new Error(`Erro ao gerar link de upload: ${error?.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("meta-catalog-feed")
    .getPublicUrl(filePath);

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: filePath,
    publicUrl: publicUrlData.publicUrl
  };
}
export async function pushDescriptionToML(productId: string, description: string) {
  // 1. Pegar produto e conexão
  const { data: product } = await supabaseAdmin
    .from("ml_products")
    .select("ml_item_id, connection_id")
    .eq("id", productId)
    .single();

  if (!product) throw new Error("Produto não encontrado no DB");

  const { data: connection } = await supabaseAdmin
    .from("ml_connections")
    .select("*")
    .eq("id", product.connection_id)
    .single();

  if (!connection) throw new Error("Conexão não encontrada");

  // 2. Renovar Token (sempre bom garantir que está fresco)
  const { refreshAccessToken } = await import("@/lib/ml");
  const { accessToken } = await refreshAccessToken(connection);

  // 3. Atualizar no ML
  const { updateDescription } = await import("@/lib/ml");
  await updateDescription(product.ml_item_id, accessToken, description);
}

export async function getActiveABTest(productId: string) {
  const { data } = await supabaseAdmin
    .from("ml_ab_tests")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "running")
    .maybeSingle();
  return data;
}

export async function createABTest(productId: string, variantA: any, variantB: any, variantBProductId: string) {
  // Cancela testes anteriores deste produto
  await supabaseAdmin
    .from("ml_ab_tests")
    .update({ status: "stopped" })
    .eq("product_id", productId)
    .eq("status", "running");
    
  if (variantBProductId && variantBProductId !== productId) {
    await supabaseAdmin
      .from("ml_ab_tests")
      .update({ status: "stopped" })
      .eq("product_id", variantBProductId)
      .eq("status", "running");
  }

  const { error } = await supabaseAdmin
    .from("ml_ab_tests")
    .insert({
      product_id: productId,
      variant_b_product_id: variantBProductId || null,
      variant_a_image: variantA.image,
      variant_a_title: variantA.title,
      variant_b_image: variantB.image,
      variant_b_title: variantB.title,
      status: "running"
    });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function stopABTest(productId: string) {
  const { error } = await supabaseAdmin
    .from("ml_ab_tests")
    .update({ status: "stopped" })
    .eq("product_id", productId)
    .eq("status", "running");

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function unlinkABTest(variantBProductId: string) {
  const { error } = await supabaseAdmin
    .from("ml_ab_tests")
    .update({ status: "stopped" })
    .eq("variant_b_product_id", variantBProductId)
    .eq("status", "running");

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
