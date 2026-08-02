"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  Zap, 
  Lock, 
  Copy, 
  Check, 
  ArrowLeft,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function StoreProductClient({
  slug,
  product,
  searchParams
}: {
  slug: string;
  product: {
    id: string;
    ml_item_id: string;
    title: string;
    price: number;
    oldPrice: number;
    imageUrl: string;
    videoUrl?: string | null;
    description: string;
    permalink: string;
    connection_id?: string;
  };
  searchParams: any;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fire ViewContent on page load
  useEffect(() => {
    const eventId = "vc_" + Math.random().toString(36).substring(2, 9);
    fetch("/api/pixel/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "ViewContent",
        eventId: eventId,
        sourceUrl: window.location.href,
        contentIds: [product.ml_item_id],
        value: product.price,
        currency: "BRL",
        customData: {
          utm_source: searchParams?.utm_source,
          utm_campaign: searchParams?.utm_campaign,
        }
      })
    }).catch(() => {});
  }, [product, searchParams]);

  const handleOpenCheckout = () => {
    setIsModalOpen(true);
    // Track InitiateCheckout
    const eventId = "init_" + Math.random().toString(36).substring(2, 9);
    fetch("/api/pixel/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "InitiateCheckout",
        eventId: eventId,
        sourceUrl: window.location.href,
        contentIds: [product.ml_item_id],
        value: product.price,
        currency: "BRL",
        customData: {
          utm_source: searchParams?.utm_source,
          utm_campaign: searchParams?.utm_campaign,
        }
      })
    }).catch(() => {});
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerCpf) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          price: product.price,
          customerName,
          customerCpf,
          customerPhone,
          utmSource: searchParams?.utm_source,
          utmCampaign: searchParams?.utm_campaign,
          gclid: searchParams?.gclid,
          connectionId: product.connection_id,
        })
      });

      const data = await res.json();
      if (data.success) {
        setPixData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.pixCopyPaste) {
      navigator.clipboard.writeText(pixData.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-emerald-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
        <span>Garantia de Entrega Rápida com Código de Rastreamento</span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <Link href={`/loja/${slug}`} className="flex items-center gap-1.5 text-slate-600 font-medium text-xs hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja</span>
        </Link>
        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Compra Garantida</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-6">
        {/* Media Player / Image Container */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative">
          {product.videoUrl ? (
            <div className="relative aspect-[9/16] sm:aspect-[4/3] max-h-[520px] bg-black flex items-center justify-center">
              <video 
                src={product.videoUrl} 
                autoPlay 
                muted 
                loop 
                playsInline 
                controls 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>Vídeo Oficial em HD</span>
              </div>
            </div>
          ) : (
            <div className="aspect-square max-h-[420px] p-6 bg-white flex items-center justify-center">
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Product Information Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
          {/* Badge & Social Proof */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">4.9 / 5.0</span>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              🔥 +1.420 vendidos esta semana
            </span>
          </div>

          {/* Title */}
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
            {product.title}
          </h1>

          {/* Price Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-400 line-through">
                R$ {product.oldPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                20% OFF
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                à vista no PIX
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              ou em até 12x de <strong className="text-slate-800">R$ {(product.price / 12 * 1.15).toFixed(2).replace(".", ",")}</strong> no cartão
            </p>
          </div>

          {/* Urgency Trigger */}
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl font-medium">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Desconto promocional válido por tempo limitado. Restam apenas <strong>4 unidades</strong> em estoque.</span>
          </div>

          {/* Action Button (Desktop & Inline) */}
          <button
            onClick={handleOpenCheckout}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-base py-4 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-yellow-300 text-yellow-300" />
            <span>COMPRAR COM 10% OFF NO PIX</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Frete Grátis com Rastreio</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pagamento 100% Seguro</span>
            </div>
          </div>
        </div>

        {/* Description Card */}
        {product.description && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Descrição do Produto
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}
      </main>

      {/* Sticky Bottom Buy Bar (Optimized for Instagram / Mobile In-App Browser) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <p className="text-[10px] text-slate-400">Total à vista</p>
            <p className="text-lg font-black text-slate-900 leading-none">
              R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <button
            onClick={handleOpenCheckout}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            <span>COMPRAR AGORA NO PIX</span>
          </button>
        </div>
      </div>

      {/* 1-Click PIX Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Checkout Transparente PIX</h3>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setPixData(null); }}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {!pixData ? (
                <form onSubmit={handleGeneratePix} className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                    <img src={product.imageUrl} alt="" className="w-12 h-12 object-contain rounded-lg bg-white p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{product.title}</p>
                      <p className="text-sm font-black text-emerald-600">
                        R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João da Silva"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CPF (para emissão da nota)</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={customerCpf}
                        onChange={(e) => setCustomerCpf(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Telefone</label>
                      <input
                        type="text"
                        placeholder="(11) 99999-9999"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm py-3.5 rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? (
                      <span>Gerando QR Code PIX...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                        <span>GERAR PIX AGORA</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* PIX Output Screen */
                <div className="text-center space-y-4 py-2">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>PIX Gerado com Sucesso! Pedido {pixData.orderId}</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Copie a chave abaixo e cole no aplicativo do seu banco para concluir o pagamento:
                  </p>

                  {/* Copy Paste Box */}
                  <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 break-all text-[11px] font-mono text-slate-700 select-all max-h-24 overflow-y-auto">
                    {pixData.pixCopyPaste}
                  </div>

                  <button
                    onClick={handleCopyPix}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>CHAVE COPIADA COM SUCESSO!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>COPIAR CHAVE PIX (COPIA E COLA)</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-[11px] text-slate-400">
                    Após efetuar o pagamento no seu banco, a aprovação é automática em poucos segundos.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
