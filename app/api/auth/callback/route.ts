import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

import { headers } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const headersList = headers();
  const forwardedHost = headersList.get("x-forwarded-host");
  const host = forwardedHost || headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto")?.split(",")[0] || (host.includes("localhost") ? "http" : "https");

  let baseUrl = process.env.APP_URL
    ? (process.env.APP_URL.startsWith("http") ? process.env.APP_URL : `https://${process.env.APP_URL}`)
    : `${protocol}://${host}`;

  baseUrl = baseUrl.replace(/\/$/, "");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error?.message || "Erro ao trocar token")}`);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${baseUrl}/login?error=Codigo_auth_ausente`);
}
