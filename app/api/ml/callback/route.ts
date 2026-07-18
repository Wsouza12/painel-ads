import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state"); // O Mercado Livre devolve o nosso state!

  if (!code || !userId) {
    return NextResponse.json({ error: "Code or State (User ID) not provided" }, { status: 400 });
  }

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
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

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to exchange code", details: await res.text() }, { status: 500 });
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  // Get user details to save nickname
  const userRes = await fetch(`https://api.mercadolibre.com/users/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` }
  });
  const userData = await userRes.json();

  // Save to DB
  const { error } = await supabaseAdmin.from("ml_connections").upsert({
    user_id: userId,
    ml_user_id: data.user_id,
    ml_nickname: userData.nickname || "User",
    client_id: process.env.ML_CLIENT_ID!,
    client_secret: process.env.ML_CLIENT_SECRET!,
    refresh_token: data.refresh_token,
    access_token: data.access_token,
    token_expires_at: expiresAt,
  }, { onConflict: "ml_user_id" });

  if (error) {
    return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
  }

  return NextResponse.redirect(`${process.env.APP_URL}/dashboard`);
}
