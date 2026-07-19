import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { refreshAccessToken, getDescription } from '@/lib/ml';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabaseAuth = createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Pegar o ml_item_id
  const { data: product } = await supabaseAdmin
    .from("ml_products")
    .select("ml_item_id, connection_id")
    .eq("id", id)
    .single();

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { data: connection } = await supabaseAdmin
    .from("ml_connections")
    .select("*")
    .eq("id", product.connection_id)
    .single();

  let accessToken = undefined;
  if (connection) {
     const res = await refreshAccessToken(connection);
     accessToken = res.accessToken;
  }

  const description = await getDescription(product.ml_item_id, accessToken);

  return NextResponse.json({ description });
}
