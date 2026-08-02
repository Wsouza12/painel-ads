import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const envCheck = {
    SUPABASE_URL: process.env.SUPABASE_URL ? "SET (" + process.env.SUPABASE_URL.substring(0, 20) + "...)" : "NOT SET",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET (" + process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + "...)" : "NOT SET",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET (length=" + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "NOT SET",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET (length=" + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")" : "NOT SET",
  };

  // Test actual query
  let queryResult: any = {};
  try {
    const { data, error, count } = await supabaseAdmin
      .from("ml_products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    queryResult = {
      error: error ? error.message : null,
      activeProductCount: count,
    };
  } catch (err: any) {
    queryResult = { catchError: err.message };
  }

  return NextResponse.json({ envCheck, queryResult }, { status: 200 });
}
