"use client";

import { useState } from "react";
import Link from "next/link";

export default function FunnelGuidePage() {
  const [budget, setBudget] = useState(50);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const topBudget = (budget * 0.7).toFixed(2);
  const remarketingBudget = (budget * 0.3).toFixed(2);

  const copyTemplates = [
    {
      title: "1️⃣ Quebra de Objeção (Garantia & Frete)",
      copy: `Ficou com alguma dúvida? Lembre-se: sua compra no Mercado Livre é 100% protegida pelo programa Compra Garantida! 🛡️\n\nReceba o produto que está esperando ou devolvemos seu dinheiro em até 30 dias. Clique no link e garanta o seu com Frete Rápido e Parcelamento em 12x! 🚚✨`,
    },
    {
      title: "2️⃣ Urgência & Escassez (Últimas Unidades)",
      copy: `Seu produto ainda está reservado com preço promocional no Mercado Livre! ⚡\n\nÚltimas unidades disponíveis com Frete Grátis e até 12x Sem Juros. Clique em Comprar Agora antes que o estoque acabe! 🛒🔥`,
    },
    {
      title: "3️⃣ Prova Social & Avaliações 5 Estrelas",
      copy: `Mais de 500 clientes já compraram e avaliaram este produto com 5 estrelas no Mercado Livre! ⭐⭐⭐⭐⭐\n\n"Entrega super rápida e produto de altíssima qualidade!". Clique no link abaixo para ver as avaliações reais e comprar com segurança! 📦👑`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black text-neutral-100 px-4 sm:px-6 py-10 selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-neutral-400 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                Tutorial: Como Criar o Funil Perfeito de Remarketing
              </h1>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm mt-2 font-medium ml-9">
              Guia passo a passo ilustrado com prints simulados do Gerenciador de Anúncios do Meta Ads.
            </p>
          </div>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
          >
            📊 Ver Analytics ao Vivo
          </Link>
        </header>

        {/* 1. Visão Geral do Funil */}
        <section className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-lg font-bold text-white">A Estrutura do Funil Perfeito no Meta Ads</h2>
              <p className="text-xs text-neutral-400">Como dividir o seu orçamento entre Atração e Remarketing para maximizar vendas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/40 border border-blue-500/30 rounded-xl p-5 space-y-3 relative">
              <span className="text-[10px] font-black text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Topo de Funil (70% do Orçamento)</span>
              <h3 className="text-sm font-bold text-white">1. Atração de Tráfego Frio</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Anúncios direcionados para público aberto usando o <strong>Feed Santo Graal (Vídeos 4:5 e 9:16)</strong>. O objetivo é fazer milhares de pessoas conhecerem seu produto e entrarem na Página Ponte.
              </p>
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-5 space-y-3 relative">
              <span className="text-[10px] font-black text-purple-400 bg-purple-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Meio de Funil (Página Ponte)</span>
              <h3 className="text-sm font-bold text-white">2. Captura do Pixel & CAPI</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Nossa Página Ponte carrega em milissegundos, dispara os eventos <strong>ViewContent</strong> e <strong>InitiateCheckout</strong> no Pixel/CAPI e redireciona com selo oficial do Mercado Livre.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-950/40 to-yellow-950/20 border border-amber-500/40 rounded-xl p-5 space-y-3 relative">
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">Fundo de Funil (30% do Orçamento)</span>
              <h3 className="text-sm font-bold text-white">3. Remarketing Ultra-Agressivo</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Anúncios exibidos <strong>exclusivamente para quem acionou o modal de compra nos últimos 3 a 7 dias</strong> com ofertas de frete grátis, parcelamento 12x e garantia!
              </p>
            </div>
          </div>

          {/* Calculadora de Orçamento */}
          <div className="bg-gradient-to-r from-purple-950/30 via-black to-indigo-950/30 p-5 rounded-xl border border-purple-500/20 space-y-4">
            <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <span>🧮</span> Calculadora de Divisão de Orçamento Diário
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/3 space-y-1">
                <label className="text-xs text-neutral-400">Seu Orçamento Diário Total (R$)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-purple-500/40 rounded-xl px-4 py-2 text-sm text-white font-bold outline-none focus:border-purple-400"
                />
              </div>
              <div className="w-full sm:w-2/3 grid grid-cols-2 gap-3 text-center">
                <div className="bg-blue-950/40 border border-blue-500/30 p-3 rounded-xl">
                  <p className="text-[10px] text-blue-300 font-bold uppercase">Atração (Topo de Funil)</p>
                  <p className="text-lg font-black text-white">R$ {topBudget} / dia</p>
                </div>
                <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl">
                  <p className="text-[10px] text-amber-300 font-bold uppercase">Remarketing (Fundo de Funil)</p>
                  <p className="text-lg font-black text-amber-300">R$ {remarketingBudget} / dia</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Passo a Passo Ilustrado (Prints Simulados do Meta Ads Manager) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📸</span>
            <div>
              <h2 className="text-xl font-bold text-white">Passo a Passo no Meta Ads Manager (Prints Guiados)</h2>
              <p className="text-xs text-neutral-400">Siga exatamente as telas abaixo no seu Gerenciador de Anúncios</p>
            </div>
          </div>

          {/* PASSO 1 */}
          <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                PASSO 1 DE 3
              </span>
              <span className="text-xs text-neutral-400 font-medium">Meta Ads Manager &gt; Públicos</span>
            </div>

            <h3 className="text-base font-bold text-white">Criar o Público Personalizado de Quem Clicou no Comprar</h3>
            <p className="text-xs text-neutral-300">
              Acesse o Gerenciador do Meta Ads, abra o menu lateral e clique em <strong>Públicos (Audiences)</strong>. Depois clique no botão azul <strong>Criar Público &gt; Público Personalizado</strong> e escolha a fonte <strong>Site</strong>.
            </p>

            {/* Print Simulado 1 */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3 font-sans shadow-inner">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <strong>Meta Ads Manager</strong> — Configuração de Público Personalizado
                </span>
                <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px]">Origem: Site (Pixel)</span>
              </div>
              
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Fonte / Pixel</label>
                    <div className="bg-black/50 border border-neutral-700 p-2 rounded text-emerald-400 font-medium flex items-center justify-between">
                      <span>🟢 Meu Pixel Meta Ads (Conectado)</span>
                      <span className="text-[9px] text-neutral-500">Ativo</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Evento</label>
                    <div className="bg-purple-950/50 border border-purple-500/50 p-2 rounded text-purple-300 font-bold flex items-center justify-between">
                      <span>⚡ InitiateCheckout (Iniciou Checkout)</span>
                      <span className="text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded">Selecionado</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs pt-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Retenção</span>
                    <div className="bg-black/50 border border-neutral-700 px-3 py-1.5 rounded text-white font-bold">
                      7 dias
                    </div>
                  </div>
                  <div className="flex-1 text-[11px] text-neutral-400">
                    Pessoas que acionaram o modal de compra nos últimos 7 dias.
                  </div>
                </div>

                {/* Bloco de Exclusão */}
                <div className="border-t border-neutral-800 pt-3">
                  <div className="bg-red-950/30 border border-red-500/30 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-red-400">Excluir Pessoas:</span>
                      <span className="text-neutral-300 ml-2 font-medium">Evento `Purchase` (Últimos 30 dias)</span>
                    </div>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded">Não gastar com quem comprou</span>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <span className="inline-block bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow">
                    Criar Público: [REMARKETING] Clicaram no Comprar (7 dias)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PASSO 2 */}
          <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                PASSO 2 DE 3
              </span>
              <span className="text-xs text-neutral-400 font-medium">Meta Ads Manager &gt; Campanhas &gt; Conjunto de Anúncios</span>
            </div>

            <h3 className="text-base font-bold text-white">Criar a Campanha de Vendas com o Público de Remarketing</h3>
            <p className="text-xs text-neutral-300">
              Crie uma nova campanha com o objetivo <strong>Vendas</strong>. No nível de Conjunto de Anúncios, selecione o público personalizado que você acabou de criar no Passo 1.
            </p>

            {/* Print Simulado 2 */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3 font-sans shadow-inner">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <strong>Configuração do Conjunto de Anúncios</strong>
                </span>
                <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px]">Objetivo: Vendas</span>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Públicos Personalizados</label>
                  <div className="bg-purple-950/40 border border-purple-500/40 p-2.5 rounded text-purple-200 font-bold flex items-center justify-between">
                    <span>👥 [REMARKETING] Clicaram no Comprar (7 dias)</span>
                    <span className="text-[10px] bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">Incluído</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Orçamento Diário</label>
                    <div className="bg-black/50 border border-neutral-700 p-2 rounded text-emerald-400 font-bold">
                      R$ {remarketingBudget} / dia
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Posicionamentos</label>
                    <div className="bg-black/50 border border-neutral-700 p-2 rounded text-white font-medium">
                      Advantage+ (Feed, Reels, Stories)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PASSO 3 */}
          <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                PASSO 3 DE 3
              </span>
              <span className="text-xs text-neutral-400 font-medium">Meta Ads Manager &gt; Nível de Anúncio</span>
            </div>

            <h3 className="text-base font-bold text-white">Vincular o Catálogo Santo Graal &amp; Usar Copy de Conversão</h3>
            <p className="text-xs text-neutral-300">
              Selecione o formato <strong>Carrossel Dinâmico / Anúncio de Catálogo</strong> usando o feed com a URL <code>&amp;bridge=true&amp;video=true</code>.
            </p>

            {/* Print Simulado 3 */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3 font-sans shadow-inner">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <strong>Configuração do Anúncio Dinâmico</strong>
                </span>
                <span className="bg-amber-950/50 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px]">👑 Feed Santo Graal Vinculado</span>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Destino dos Cliques</label>
                  <div className="bg-black/50 border border-purple-500/30 p-2 rounded text-purple-300 font-mono text-[11px] truncate">
                    https://mercadoshops.up.railway.app/p/[id]?bridge=true
                  </div>
                </div>
                <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg text-amber-200/80 text-[11px]">
                  ✓ Todos os cliques serão direcionados para a sua Página Ponte com Pixel + CAPI ativados e transição de 2s para o Mercado Livre!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Textos Prontos para Copiar (1-Click Copy) */}
        <section className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-lg font-bold text-white">Copys Prontas de Fundo de Funil (Copie e Cole)</h2>
              <p className="text-xs text-neutral-400">Use estes textos testados nos seus anúncios de remarketing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {copyTemplates.map((item, idx) => (
              <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-purple-300">{item.title}</h3>
                  <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed bg-black/50 p-3 rounded-lg border border-white/5 font-sans">
                    {item.copy}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(item.copy, idx)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    copiedIndex === idx
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  }`}
                >
                  {copiedIndex === idx ? "✅ Copiado!" : "📋 Copiar Texto"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
