import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/ml/connect → redireciona pro consentimento OAuth do ML
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${process.env.APP_URL}/login`);
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
