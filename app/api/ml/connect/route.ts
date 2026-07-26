import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/ml/connect → redireciona pro consentimento OAuth do ML
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let appUrl = process.env.APP_URL || "https://mercadoshops.up.railway.app";
  if (appUrl.includes("localhost") && process.env.NODE_ENV === "production") {
    appUrl = "https://mercadoshops.up.railway.app";
  }
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.ML_CLIENT_ID!,
    redirect_uri: process.env.ML_REDIRECT_URI!, // ex: https://seuapp.com/api/ml/callback
    state: user.id, // O Mercado Livre devolve isso na callback!
  });

  return NextResponse.redirect(
    `https://auth.mercadolivre.com.br/authorization?${params.toString()}`
  );
}
