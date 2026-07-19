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
    <div className="pt-4 border-t border-neutral-800">
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-800 mb-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("feeds")}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "feeds"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
          }`}
        >
          Feeds (Catálogos)
        </button>
        <button
          onClick={() => setActiveTab("pixel")}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "pixel"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
          }`}
        >
          Pixel (Página Ponte)
        </button>
        <button
          onClick={() => setActiveTab("meta")}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "meta"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
          }`}
        >
          Tutorial Meta Ads
        </button>
        <button
          onClick={() => setActiveTab("google")}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "google"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
          }`}
        >
          Tutorial Google Ads
        </button>
      </div>

      {/* Tab Content */}
      <div className="text-sm">
        {activeTab === "feeds" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
            <div>
              <p className="text-neutral-400 mb-1 font-bold">1. Feed Padrão (Direto pro ML):</p>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <code className="flex-1 bg-neutral-800 rounded px-3 py-2 break-all text-xs border border-neutral-700 select-all">
                  {standardFeed}
                </code>
              </div>
              
              <p className="text-purple-400 mb-1 font-bold">2. Feed Página Ponte (Com Pixel):</p>
              <p className="text-xs text-neutral-400 mb-2">Use este link no catálogo se quiser que os anúncios direcionem para a nossa Página Ponte.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="flex-1 bg-neutral-800 rounded px-3 py-2 break-all text-xs border border-purple-900/50 select-all">
                  {bridgeFeed}
                </code>
              </div>
            </div>
            <div className="pt-2">
              <a
                href="https://business.facebook.com/commerce"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.3)] w-full sm:w-auto"
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
          }} className="space-y-2 p-4 bg-neutral-900 border border-neutral-700 rounded-md animate-in fade-in slide-in-from-bottom-2">
            <p className="font-bold text-neutral-200">Pixel do Facebook (Página Ponte)</p>
            <p className="text-xs text-neutral-400 mb-3">
              Cole o ID do seu Pixel para rastrear quem entra na Página Ponte e clica em Comprar.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                name="pixelId" 
                defaultValue={connection.meta_pixel_id || ""} 
                placeholder="Ex: 123456789012345" 
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm" 
              />
              <button 
                type="submit" 
                disabled={isPending}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors w-32 flex items-center justify-center"
              >
                {isPending ? "..." : isSaved ? "✅ Salvo!" : "Salvar Pixel"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "meta" && (
          <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded text-xs text-blue-200/70 space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <p className="font-bold text-blue-400">Como conectar no Facebook Ads:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Acesse o <strong className="text-white">Commerce Manager</strong> pelo botão na aba Feeds.</li>
              <li>Escolha o seu Catálogo (ou crie um novo).</li>
              <li>No menu lateral, vá em <strong>Catálogo &gt; Fontes de Dados</strong>.</li>
              <li>Clique em <strong>Adicionar itens &gt; Feed de Dados (Data feed)</strong>.</li>
              <li>Escolha <strong>Upload Programado (Scheduled feed)</strong> e cole o link do feed que preferir.</li>
              <li>Selecione <strong>Atualização a cada hora (Hourly)</strong>. Pronto!</li>
            </ol>
          </div>
        )}

        {activeTab === "google" && (
          <div className="p-4 bg-green-900/10 border border-green-900/30 rounded text-xs text-green-200/70 space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <p className="font-bold text-green-400">Como conectar no Google Ads (Merchant Center):</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Acesse o <strong className="text-white"><a href="https://merchants.google.com/" target="_blank" className="underline hover:text-green-300">Google Merchant Center</a></strong> e crie sua conta grátis.</li>
              <li>No menu lateral, vá em <strong>Produtos &gt; Feeds</strong>.</li>
              <li>Clique no botão azul <strong>+</strong> para criar um feed principal.</li>
              <li>Escolha <strong>Busca programada (Scheduled fetch)</strong>.</li>
              <li>Dê um nome, cole o link do feed (Feed Padrão) no campo de URL do arquivo e salve.</li>
              <li>O Google fará a leitura e seus produtos estarão prontos para o Google Shopping!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
