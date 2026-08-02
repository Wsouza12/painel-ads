import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf");

    if (!cpf) {
      return NextResponse.json({ success: false, message: "CPF não fornecido" }, { status: 400 });
    }

    const cleanCpf = cpf.replace(/\D/g, "");

    // 1. Encontrar o customer
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("cpf", cleanCpf)
      .maybeSingle();

    if (!customer) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // 2. Buscar os pedidos
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error: any) {
    console.error("Customer Orders API Error:", error);
    return NextResponse.json({ success: false, message: "Erro ao buscar pedidos" }, { status: 500 });
  }
}
