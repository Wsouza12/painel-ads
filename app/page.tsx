import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              P
            </div>
            <span className="font-bold text-xl tracking-tight">PainelAds</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Acessar Plataforma
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-purple-400 mb-8 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          Sistema v2.0 Online
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          Transforme Anúncios <br className="hidden md:block" /> em Máquinas de Venda.
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          Transforme os anúncios no catálogo e transforme o Ads em uma máquina de vendas.
        </p>
        
        <Link
          href="/login"
          className="group relative inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
        >
          Acessar Dashboard
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-900 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Copy Inteligente</h3>
            <p className="text-neutral-400 leading-relaxed">
              Descrições e títulos otimizados para alta conversão gerados instantaneamente pela nossa IA avançada.
            </p>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-900 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Laboratório A/B</h3>
            <p className="text-neutral-400 leading-relaxed">
              Descubra o que vende mais testando de forma automática narrativas Premium vs Oferta no Facebook Ads.
            </p>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-900 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Integração Direta</h3>
            <p className="text-neutral-400 leading-relaxed">
              Sincronize todo o seu estoque do Mercado Livre com apenas 1 clique, sem planilhas ou burocracia.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
