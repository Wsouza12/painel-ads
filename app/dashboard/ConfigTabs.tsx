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
                  Feed de Vídeo (Página Ponte):
                </p>
                <p className="text-[11px] text-pink-200/60 mb-3">Crie um catálogo separado e use este link para campanhas focadas em vídeos (Adicione as URLs de vídeo em cada produto na aba Início).</p>
                <code className="block w-full bg-black/50 rounded-lg px-4 py-3 break-all text-xs border border-pink-500/20 select-all text-pink-400 font-medium">
                  {bridgeFeed}&amp;video=true
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
          <div className="p-6 bg-gradient-to-br from-blue-900/10 to-transparent border border-blue-500/20 rounded-2xl text-sm text-blue-100/70 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <p className="font-bold text-blue-400 text-base">Como conectar no Facebook Ads:</p>
            <ol className="list-decimal list-inside space-y-3 marker:text-blue-500/50">
              <li>Acesse o <strong className="text-white">Commerce Manager</strong> pelo botão na aba Feeds.</li>
              <li>Escolha o seu Catálogo (ou crie um novo).</li>
              <li>No menu lateral, vá em <strong className="text-white">Catálogo &gt; Fontes de Dados</strong>.</li>
              <li>Clique em <strong className="text-white">Adicionar itens &gt; Feed de Dados (Data feed)</strong>.</li>
              <li>Escolha <strong className="text-white">Upload Programado (Scheduled feed)</strong> e cole o link do feed que preferir.</li>
              <li>Selecione <strong className="text-white">Atualização a cada hora (Hourly)</strong>. Pronto!</li>
            </ol>
          </div>
        )}

        {activeTab === "google" && (
          <div className="p-6 bg-gradient-to-br from-green-900/10 to-transparent border border-green-500/20 rounded-2xl text-sm text-green-100/70 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <p className="font-bold text-green-400 text-base">Como conectar no Google Ads (Merchant Center):</p>
            <ol className="list-decimal list-inside space-y-3 marker:text-green-500/50">
              <li>Acesse o <strong className="text-white"><a href="https://merchants.google.com/" target="_blank" className="underline hover:text-green-300">Google Merchant Center</a></strong> e crie sua conta grátis.</li>
              <li>No menu lateral, vá em <strong className="text-white">Produtos &gt; Feeds</strong>.</li>
              <li>Clique no botão azul <strong className="text-white">+</strong> para criar um feed principal.</li>
              <li>Escolha <strong className="text-white">Busca programada (Scheduled fetch)</strong>.</li>
              <li>Dê um nome, cole o link do feed (Feed Padrão) no campo de URL do arquivo e salve.</li>
              <li>O Google fará a leitura e seus produtos estarão prontos para o Google Shopping!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
