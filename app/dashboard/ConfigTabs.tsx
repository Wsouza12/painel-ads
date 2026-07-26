"use client";

import { useState, useTransition, useEffect } from "react";

export default function ConfigTabs({ 
  connection, 
  savePixelIdAction 
}: { 
  connection: any;
  savePixelIdAction: (formData: FormData) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState("feeds");
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const standardFeed = origin ? `${origin}/api/ml/feed/${connection.id}` : connection.feed_url;
  const bridgeFeed = origin ? `${origin}/api/ml/feed/${connection.id}?bridge=true` : `${connection.feed_url}?bridge=true`;

  return (
    <div className="pt-6 mt-6 border-t border-white/10">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
        <button
          onClick={() => setActiveTab("feeds")}
          className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-all ${
            activeTab === "feeds"
              ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          Feeds (Catálogos)
        </button>
        <button
          onClick={() => setActiveTab("pixel")}
          className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-all ${
            activeTab === "pixel"
              ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          Pixel (Página Ponte)
        </button>
        <button
          onClick={() => setActiveTab("meta")}
          className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-all ${
            activeTab === "meta"
              ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          Tutorial Meta Ads
        </button>
        <button
          onClick={() => setActiveTab("google")}
          className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-all ${
            activeTab === "google"
              ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          Tutorial Google Ads
        </button>
        <a
          href="/dashboard/funnel"
          className="px-4 py-2 text-sm font-bold whitespace-nowrap rounded-lg bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 text-amber-300 border border-amber-500/40 hover:scale-105 transition-all flex items-center gap-1.5"
        >
          <span>🎯</span> Tutorial Funil &amp; Remarketing ↗
        </a>
      </div>

      {/* Tab Content */}
      <div className="text-sm">
        {activeTab === "feeds" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5">
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-neutral-300 mb-2 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
                  Feed Padrão (Direto pro ML):
                </p>
                <code className="block w-full bg-black/50 rounded-lg px-4 py-3 break-all text-xs border border-white/5 select-all text-emerald-400 font-medium">
                  {standardFeed}
                </code>
              </div>
              
              <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
                <p className="text-purple-300 mb-1 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">2</span>
                  Feed Página Ponte (Com Pixel):
                </p>
                <p className="text-[11px] text-purple-200/60 mb-3">Use este link no catálogo se quiser que os anúncios direcionem para a nossa Página Ponte.</p>
                <code className="block w-full bg-black/50 rounded-lg px-4 py-3 break-all text-xs border border-purple-500/20 select-all text-purple-400 font-medium">
                  {bridgeFeed}
                </code>
              </div>

              <div className="bg-pink-900/10 p-4 rounded-xl border border-pink-500/20">
                <p className="text-pink-300 mb-1 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px]">3</span>
                  Feed de Vídeo (Direto pro Mercado Livre):
                </p>
                <p className="text-[11px] text-pink-200/60 mb-3">Crie um catálogo separado e use este link para campanhas focadas em vídeos. Este link joga o cliente direto para o Mercado Livre.</p>
                <code className="block w-full bg-black/50 rounded-lg px-4 py-3 break-all text-xs border border-pink-500/20 select-all text-pink-400 font-medium">
                  {standardFeed}?video=true
                </code>
              </div>

              <div className="bg-gradient-to-r from-amber-950/30 to-yellow-950/30 p-4 rounded-xl border border-amber-500/30">
                <p className="text-amber-300 mb-1 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center text-[10px]">👑</span>
                  Feed Santo Graal (Vídeo + Página Ponte + Pixel/CAPI):
                </p>
                <p className="text-[11px] text-amber-200/70 mb-3">A combinação máxima! Inclui vídeos 4:5 e 9:16 + Fotos + Página Ponte com rastreamento Pixel & CAPI ativado.</p>
                <code className="block w-full bg-black/50 rounded-lg px-4 py-3 break-all text-xs border border-amber-500/30 select-all text-amber-300 font-medium">
                  {bridgeFeed}&video=true
                </code>
              </div>
            </div>
            <div className="pt-2">
              <a
                href="https://business.facebook.com/commerce"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 w-full sm:w-auto"
              >
                Abrir Commerce Manager ↗
              </a>
            </div>
          </div>
        )}

        {activeTab === "pixel" && (
          <form action={(formData) => {
            startTransition(async () => {
              await savePixelIdAction(formData);
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
            });
          }} className="space-y-4 p-6 bg-black/30 border border-white/5 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
            <div>
              <p className="font-bold text-white text-base">Pixel do Facebook (Página Ponte)</p>
              <p className="text-sm text-neutral-400 mt-1">
                Cole o ID do seu Pixel para rastrear quem entra na Página Ponte e clica em Comprar.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                name="pixelId" 
                defaultValue={connection.meta_pixel_id || ""} 
                placeholder="Ex: 123456789012345" 
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
              />
              <button 
                type="submit" 
                disabled={isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/20 w-full sm:w-40 flex items-center justify-center"
              >
                {isPending ? "..." : isSaved ? "✅ Salvo!" : "Salvar Pixel"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "meta" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Guia dos 4 Catálogos */}
            <div className="p-6 bg-gradient-to-br from-amber-950/20 via-purple-950/20 to-black border border-amber-500/30 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <span>📖</span> Guia Rápido: Qual dos 4 Links de Catálogo Escolher?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-black/50 p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="inline-block px-2.5 py-1 bg-white/10 text-neutral-200 rounded-md font-bold">1. Feed Padrão</span>
                  <p className="text-neutral-300 font-semibold">Direto pro Mercado Livre (Apenas Fotos)</p>
                  <p className="text-neutral-400"><strong>Quando usar:</strong> Campanhas diretas simples de catálogo de fotos sem passar por página ponte nem Pixel próprio.</p>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-purple-500/20 space-y-2">
                  <span className="inline-block px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-md font-bold">2. Feed Página Ponte</span>
                  <p className="text-purple-200 font-semibold">Fotos + Rastreamento Pixel/CAPI</p>
                  <p className="text-purple-300/70"><strong>Quando usar:</strong> Campanhas de conversão com fotos onde você quer marcar o Pixel e CAPI (PageView + ViewContent) na sua Página Ponte antes de ir pro ML.</p>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-pink-500/20 space-y-2">
                  <span className="inline-block px-2.5 py-1 bg-pink-500/20 text-pink-300 rounded-md font-bold">3. Feed de Vídeo</span>
                  <p className="text-pink-200 font-semibold">Vídeos 4:5 e 9:16 + Direto pro ML</p>
                  <p className="text-pink-300/70"><strong>Quando usar:</strong> Campanhas focadas em Anúncios Dinâmicos de Vídeo (Reels/Stories/Feed) mandando o cliente direto para o Mercado Livre.</p>
                </div>

                <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 p-4 rounded-xl border border-amber-500/40 space-y-2">
                  <span className="inline-block px-2.5 py-1 bg-amber-500/30 text-amber-300 rounded-md font-bold">👑 4. Feed Santo Graal (Recomendado)</span>
                  <p className="text-amber-200 font-semibold">Vídeos 4:5 e 9:16 + Fotos + Página Ponte + Pixel/CAPI</p>
                  <p className="text-amber-300/80"><strong>Quando usar:</strong> A combinação perfeita de alta conversão! Exibe vídeos dinâmicos no Instagram/Facebook e rastreia 100% dos cliques com Pixel/CAPI antes do ML.</p>
                </div>
              </div>
            </div>

            {/* Passo a Passo Meta Ads */}
            <div className="p-6 bg-gradient-to-br from-blue-900/10 to-transparent border border-blue-500/20 rounded-2xl text-sm text-blue-100/70 space-y-4">
              <p className="font-bold text-blue-400 text-base">Passo a Passo: Como Conectar no Meta Ads (Commerce Manager)</p>
              <ol className="list-decimal list-inside space-y-3 marker:text-blue-500/50 text-xs sm:text-sm">
                <li>Acesse o <strong className="text-white">Commerce Manager</strong> pelo botão azul na aba Feeds.</li>
                <li>Escolha o seu Catálogo (ou crie um novo tipo "Comércio de Produtos").</li>
                <li>No menu lateral esquerdo, clique em <strong className="text-white">Catálogo &gt; Fontes de Dados (Data sources)</strong>.</li>
                <li>Clique em <strong className="text-white">Adicionar itens &gt; Feed de Dados (Data feed)</strong>.</li>
                <li>Selecione <strong className="text-white">Upload Programado (Scheduled feed)</strong> e cole o link do catálogo escolhido.</li>
                <li>Defina a frequência de atualização para <strong className="text-white">A cada hora (Hourly)</strong> e confirme. Pronto!</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === "google" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Guia Google Shopping */}
            <div className="p-6 bg-gradient-to-br from-emerald-950/20 via-green-950/20 to-black border border-emerald-500/30 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <span>🚀</span> Como Dominar o Google Shopping &amp; Performance Max (PMax)
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Diferente do Meta Ads (onde a pessoa vê o anúncio enquanto rola o feed), no <strong>Google Ads o comprador já está PESQUISANDO pelo nome do produto</strong> no motor de busca! A taxa de intenção de compra é gigante.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-black/50 p-4 rounded-xl border border-emerald-500/20 space-y-2">
                  <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-md font-bold">1. Google Shopping Padrão</span>
                  <p className="text-neutral-300 font-semibold">Usa o Feed Padrão (Direto pro ML)</p>
                  <p className="text-neutral-400">Exibe a foto do seu produto no topo da pesquisa do Google. Quando o comprador clica, vai direto para a sua página no Mercado Livre.</p>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-purple-500/20 space-y-2">
                  <span className="inline-block px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-md font-bold">2. Google PMax + Página Ponte</span>
                  <p className="text-purple-200 font-semibold">Usa o Feed Santo Graal (&amp;bridge=true)</p>
                  <p className="text-purple-300/70">Exibe no Google Shopping, YouTube e Gmail. O comprador passa pela Página Ponte, dispara o Pixel + CAPI e cai no Mercado Livre.</p>
                </div>
              </div>
            </div>

            {/* Passo a Passo Google Merchant Center */}
            <div className="p-6 bg-gradient-to-br from-green-900/10 to-transparent border border-green-500/20 rounded-2xl text-sm text-green-100/70 space-y-4">
              <p className="font-bold text-green-400 text-base">Passo a Passo: Como Conectar no Google Merchant Center</p>
              <ol className="list-decimal list-inside space-y-3 marker:text-green-500/50 text-xs sm:text-sm">
                <li>Acesse o <strong className="text-white"><a href="https://merchants.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">Google Merchant Center</a></strong> e crie sua conta gratuita.</li>
                <li>No menu lateral esquerdo, vá em <strong className="text-white">Produtos &gt; Feeds</strong> (ou *Fontes de Dados*).</li>
                <li>Clique no botão azul <strong className="text-white">+ Adicionar Feed Principal</strong>.</li>
                <li>Escolha o método: <strong className="text-white">Busca Programada (Scheduled fetch)</strong>.</li>
                <li>No campo de URL do arquivo, cole o link do nosso **Feed Padrão** ou **Feed Santo Graal**.</li>
                <li>Defina a frequência de busca para <strong className="text-white">Diária (Daily)</strong> e clique em Salvar.</li>
                <li>O Google processará os seus produtos e você poderá vincular a conta do Merchant Center ao **Google Ads** para criar campanhas de **Performance Max / Google Shopping**!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
