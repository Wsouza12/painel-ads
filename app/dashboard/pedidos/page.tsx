import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OrdersAdminClient from "./OrdersAdminClient";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use anon or service role depending on auth strategy
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch metrics and orders
  const { data: ordersData } = await supabase
    .from("orders")
    .select(`
      *,
      customers (
        name,
        cpf,
        phone,
        email
      )
    `)
    .order("created_at", { ascending: false });

  const orders = ordersData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-slate-800">
        <Package className="w-6 h-6" />
        <h1 className="text-2xl font-bold tracking-tight">Pedidos & Expedição</h1>
      </div>

      <OrdersAdminClient initialOrders={orders} />
    </div>
  );
}
