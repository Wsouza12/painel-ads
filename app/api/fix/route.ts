import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('ml_products')
    .update({ parent_id: null, is_variant_b: false })
    .ilike('original_title', '%Escova%');
  
  return NextResponse.json({ success: true, data, error });
}
