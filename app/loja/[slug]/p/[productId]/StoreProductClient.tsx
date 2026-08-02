"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
    
    router.push(`/checkout/${product.id}?slug=${slug}`);
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
          
          {/* Selo de Garantia Incondicional CDC */}
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Risco Zero: Garantia de 7 Dias</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                De acordo com o Art. 49 do CDC, você tem 7 dias de garantia incondicional. Se não gostar do produto, devolvemos 100% do seu dinheiro sem perguntas.
              </p>
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

        {/* Prova Social: Depoimentos */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            O que dizem nossos clientes
          </h2>
          <div className="space-y-4">
            {/* Depoimento 1 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs">MA</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Maria Aparecida</p>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3"/> Compra Verificada</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">"Chegou super rápido, bem antes do prazo! O produto é de excelente qualidade e idêntico ao anúncio. Recomendo de olhos fechados."</p>
            </div>
            
            {/* Depoimento 2 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs">RO</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Roberto Oliveira</p>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3"/> Compra Verificada</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">"Fiquei com receio de comprar na internet, mas a loja passou muita confiança com o rastreio. Valeu cada centavo."</p>
            </div>

            {/* Depoimento 3 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs">AS</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Aline Silva</p>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3"/> Compra Verificada</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">"O suporte pelo WhatsApp me ajudou bastante com minhas dúvidas. Atendimento nota 10!"</p>
            </div>
          </div>
        </div>

        {/* Rodapé LGPD e Trust */}
        <div className="mt-8 mb-4 border-t border-slate-200 pt-8 pb-4 text-center">
          <div className="flex justify-center items-center gap-4 text-slate-400 mb-6 grayscale opacity-60">
            <div className="h-6 w-9 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-600">VISA</div>
            <div className="h-6 w-9 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-600">MC</div>
            <div className="h-6 w-9 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-600">PIX</div>
            <div className="h-6 w-9 bg-slate-100 rounded flex items-center justify-center text-[9px] font-bold text-slate-600">BOLETO</div>
          </div>
          
          <div className="text-[10px] text-slate-500 space-y-2 mb-4">
            <p className="font-bold text-slate-700">Sua Loja LTDA - CNPJ: 00.000.000/0001-00</p>
            <p>Rua Fictícia, 123 - Centro, São Paulo - SP</p>
            <p>contato@sualoja.com.br | Horário: Seg a Sex 09h às 18h</p>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] font-medium text-emerald-600">
            <Link href="#" className="hover:underline">Políticas de Privacidade</Link>
            <span className="text-slate-300">•</span>
            <Link href="#" className="hover:underline">Termos de Uso</Link>
            <span className="text-slate-300">•</span>
            <Link href="/politica-de-devolucao" className="hover:underline">Trocas e Devoluções</Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] text-slate-400">
            <Lock className="w-3 h-3" />
            <span>Site 100% Seguro e Protegido. Em conformidade com a LGPD.</span>
          </div>
        </div>
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
    </div>
  );
}