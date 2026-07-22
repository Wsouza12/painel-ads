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
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black text-neutral-100 px-6 py-10 selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
              Catálogo ML → Meta
            </h1>
            <p className="text-neutral-400 text-sm mt-2 font-medium">
              Sincronização inteligente de anúncios e otimização por IA.
            </p>
          </div>
          <a
            href="/prompt-generator/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] shadow-lg"
          >
            <span className="group-hover:animate-pulse">✨</span> Gerador de Prompts IA
          </a>
        </header>

        {!connection ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-md p-8 text-center shadow-2xl">
            <p className="text-neutral-300 mb-6 text-lg">Você ainda não conectou o Mercado Livre.</p>
            <a
              href="/api/ml/connect"
              className="inline-block rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
            >
              Conectar Mercado Livre agora
            </a>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Efeito de brilho no card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
                  <span className="text-yellow-400 font-bold text-lg">ML</span>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Conta Conectada</p>
                  <p className="font-bold text-lg text-white">{connection.ml_nickname ?? connection.ml_user_id}</p>
                </div>
              </div>
              <form action="/api/ml/sync/manual" method="POST">
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                  Sincronizar Catálogo
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

        <div className="rounded-2xl border border-white/5 bg-neutral-900/20 backdrop-blur-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Últimas sincronizações
          </h2>
          <div className="space-y-3">
            {logs?.length ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-white/5 bg-black/20 px-5 py-4 text-sm hover:bg-black/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full ${log.status === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {log.status === "success" ? "✓" : "✗"}
                    </span>
                    <span className="text-neutral-300 font-medium">
                      {log.status === "success"
                        ? `${log.products_count} produtos processados`
                        : log.error_message}
                    </span>
                  </div>
                  <span className="text-neutral-500 text-xs font-medium bg-white/5 px-3 py-1 rounded-full">
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
