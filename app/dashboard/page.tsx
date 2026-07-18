import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import ProductList from "@/components/ProductList";

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
        <header>
          <h1 className="text-2xl font-semibold">Catálogo ML → Meta</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Status da sincronização dos seus anúncios com o catálogo do Meta.
          </p>
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
              <div className="text-sm">
                <p className="text-neutral-400 mb-1">URL do feed (cole no Meta Commerce Manager):</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <code className="flex-1 bg-neutral-800 rounded px-3 py-2 break-all text-xs border border-neutral-700 select-all">
                    {connection.feed_url}
                  </code>
                  <a
                    href="https://business.facebook.com/commerce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                  >
                    Abrir Commerce Manager ↗
                  </a>
                </div>
                
                <div className="mt-4 p-3 bg-blue-900/10 border border-blue-900/30 rounded text-xs text-blue-200/70 space-y-2">
                  <p className="font-bold text-blue-400">Como conectar no Facebook Ads:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Acesse o <strong className="text-white">Commerce Manager</strong> pelo botão acima.</li>
                    <li>Escolha o seu Catálogo (ou crie um novo).</li>
                    <li>No menu lateral, vá em <strong>Catálogo &gt; Fontes de Dados</strong>.</li>
                    <li>Clique em <strong>Adicionar itens &gt; Feed de Dados (Data feed)</strong>.</li>
                    <li>Escolha <strong>Upload Programado (Scheduled feed)</strong> e cole o link acima.</li>
                    <li>Selecione <strong>Atualização a cada hora (Hourly)</strong>. Pronto!</li>
                  </ol>
                </div>
              </div>
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
