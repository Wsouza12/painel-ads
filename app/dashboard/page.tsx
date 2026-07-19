import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import ProductList from "@/components/ProductList";
import ConfigTabs from "./ConfigTabs";
import { savePixelId } from "./actions";

export const revalidate = 0; // force dynamic

export default async function DashboardPage() {
  const supabaseAuth = createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    return <div>Não autenticado.</div>;
  }

  // Busca conta do Mercado Livre vinculada a este usuário
  const { data: connection } = await supabaseAdmin
    .from("ml_connections")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: logs } = await supabaseAdmin
    .from("sync_logs")
    .select("*")
    .eq("connection_id", connection?.id || "")
    .order("ran_at", { ascending: false })
    .limit(10);

  const { data: products } = await supabaseAdmin
    .from("ml_products")
    .select("*")
    .eq("connection_id", connection?.id || "")
    .order("updated_at", { ascending: false });

  const { data: abTests } = await supabaseAdmin
    .from("ml_ab_tests")
    .select("*")
    .eq("status", "running");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Catálogo ML → Meta</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Status da sincronização dos seus anúncios com o catálogo do Meta.
            </p>
          </div>
          <a
            href="/prompt-generator/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            <span>✨</span> Gerador de Prompts IA
          </a>
        </header>

        {!connection ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-center">
            <p className="text-neutral-300 mb-4">Nenhuma conta do Mercado Livre conectada ainda.</p>
            <a
              href="/api/ml/connect"
              className="inline-block rounded-md px-4 py-2 font-medium text-white"
              style={{ backgroundColor: "#1D9E75" }}
            >
              Conectar Mercado Livre
            </a>
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Conta conectada</p>
                <p className="font-medium">{connection.ml_nickname ?? connection.ml_user_id}</p>
              </div>
              <form action="/api/ml/sync/manual" method="POST">
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: "#1D9E75" }}
                >
                  Sincronizar agora
                </button>
              </form>
            </div>

            {connection.feed_url && (
              <ConfigTabs 
                connection={connection} 
                savePixelIdAction={savePixelId.bind(null, connection.id)}
              />
            )}
          </div>
        )}

        <ProductList products={products || []} abTests={abTests || []} />

        <div>
          <h2 className="text-sm font-medium text-neutral-400 mb-3">Últimas sincronizações</h2>
          <div className="space-y-2">
            {logs?.length ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm"
                >
                  <span
                    className={log.status === "success" ? "text-emerald-400" : "text-red-400"}
                  >
                    {log.status === "success" ? "✓ sucesso" : "✗ erro"}
                  </span>
                  <span className="text-neutral-400">
                    {log.status === "success"
                      ? `${log.products_count} produtos`
                      : log.error_message}
                  </span>
                  <span className="text-neutral-500 text-xs">
                    {new Date(log.ran_at).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-sm">Nenhuma sincronização rodou ainda.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
