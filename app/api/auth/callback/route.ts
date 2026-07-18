import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}${next}`);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/login?error=Nao_foi_possivel_autenticar`);
}
