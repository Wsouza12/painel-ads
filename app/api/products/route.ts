import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabaseAuth = createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connection } = await supabaseAdmin
    .from("ml_connections")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!connection) {
    return NextResponse.json({ products: [] });
  }

  const { data: products } = await supabaseAdmin
    .from("ml_products")
    .select("id, original_title, custom_title, original_price, custom_price")
    .eq("connection_id", connection.id)
    .order("updated_at", { ascending: false });

  return NextResponse.json({ products: products || [] });
}
