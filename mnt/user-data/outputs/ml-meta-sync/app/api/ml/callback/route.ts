import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/ml/callback?code=... → troca o code por tokens e salva no banco
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "code ausente na URL de callback" }, { status: 400 });
  }

  const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ML_CLIENT_ID!,
      client_secret: process.env.ML_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.ML_REDIRECT_URI!,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    return NextResponse.json({ error: "Falha ao trocar code por token", detail: errText }, { status: 400 });
  }

  const tokenData = await tokenRes.json();

  // Pega o nickname do vendedor pra exibir no dashboard
  const userRes = await fetch(`https://api.mercadolibre.com/users/${tokenData.user_id}`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = userRes.ok ? await userRes.json() : null;

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  const { error } = await supabaseAdmin.from("ml_connections").upsert(
    {
      ml_user_id: tokenData.user_id,
      ml_nickname: userData?.nickname ?? null,
      client_id: process.env.ML_CLIENT_ID!,
      client_secret: process.env.ML_CLIENT_SECRET!,
      refresh_token: tokenData.refresh_token,
      access_token: tokenData.access_token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "ml_user_id" }
  );

  if (error) {
    return NextResponse.json({ error: "Falha ao salvar conexão", detail: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
