import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Star, 
  Search, 
  ShoppingBag, 
  Zap, 
  CheckCircle2, 
  Lock,
  ArrowRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StorePage({ params }: { params: { slug: string } }) {
  // 1. Fetch connection by ml_nickname or id or fallback to top connection
  let connection = null;
  const { data: connByNick } = await supabaseAdmin
    .from("ml_connections")
    .select("*")
    .ilike("ml_nickname", params.slug)
    .maybeSingle();

  connection = connByNick;

  if (!connection) {
    const { data: connById } = await supabaseAdmin
      .from("ml_connections")
      .select("*")
      .eq("id", params.slug)
      .maybeSingle();

    connection = connById;
  }

  // Fallback: take the first active connection if slug is "oficial" or "default"
  if (!connection && (params.slug === "oficial" || params.slug === "loja" || params.slug === "produtos")) {
    const { data: firstConn } = await supabaseAdmin
      .from("ml_connections")
      .select("*")
      .limit(1)
      .maybeSingle();

    connection = firstConn;
  }

  // 2. Fetch products for this store
  let products: any[] = [];
  if (connection) {
    const { data } = await supabaseAdmin
      .from("ml_products")
      .select("*")
      .eq("connection_id", connection.id)
      .order("created_at", { ascending: false });
    
    products = data || [];
  } else {
    // If no specific connection match, fetch all active products
    const { data } = await supabaseAdmin
      .from("ml_products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24);

    products = data || [];
  }

  const storeName = connection?.ml_nickname ? `Loja Oficial ${connection.ml_nickname}` : "Loja Oficial Premium";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-sm">
        <Zap className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
        <span>OFERTA DE HOJE: <strong>Frete Grátis</strong> para Todo o Brasil + <strong>10% OFF no PIX</strong></span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={`/loja/${params.slug}`} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              {storeName.charAt(0)}
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none block">
                {storeName}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                Vendedor Verificado ✓
              </span>
            </div>
          </Link>

          {/* Search Bar - Hidden on small mobile */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input 
              type="text" 
              placeholder="Buscar produtos na loja..." 
              className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          </div>

          {/* Cart / Trust Icon */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Loja 100% Segura</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
              <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              Sua Compra Direta com Garantia de Fábrica
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Os Melhores Produtos com <span className="text-emerald-400">Preço de Atacado</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Enviamos para todo o Brasil com código de rastreamento e pagamento seguro no PIX em 1 clique.
            </p>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center space-y-1">
              <Truck className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold">Envio Imediato</p>
              <p className="text-[10px] text-slate-300">Despacho em 24h</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center space-y-1">
              <Lock className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold">PIX em 2 Segundos</p>
              <p className="text-[10px] text-slate-300">10% de Desconto</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Produtos em Destaque</h2>
            <p className="text-xs text-slate-500 mt-1">Selecione o produto desejado para ver detalhes e comprar com desconto</p>
          </div>
          <span className="text-xs font-bold bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
            {products.length} itens disponíveis
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">Nenhum produto cadastrado nesta loja ainda</h3>
            <p className="text-xs text-slate-500">Conecte sua conta do Mercado Livre no painel para importar produtos automaticamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((item) => {
              const title = item.custom_title || item.original_title;
              const price = item.custom_price || item.original_price;
              const oldPrice = price * 1.25; // 20% fake discount for anchor
              const imageUrl = item.custom_image_url || item.original_image_url;
              const hasVideo = Boolean(item.custom_video_url || item.custom_video_url_square);

              return (
                <Link 
                  key={item.id}
                  href={`/loja/${params.slug}/p/${item.id}`}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col group relative"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-sm">
                    20% OFF
                  </div>

                  {/* Video Badge if available */}
                  {hasVideo && (
                    <div className="absolute top-2.5 right-2.5 z-10 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                      <span>🎥 Com Vídeo</span>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="aspect-square bg-slate-100 relative overflow-hidden p-4 flex items-center justify-center">
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">(4.9)</span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                        {title}
                      </h3>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <p className="text-[11px] text-slate-400 line-through">
                        R$ {oldPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl font-black text-slate-900">
                          R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">no PIX</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        ou 12x de R$ {(price / 12 * 1.15).toFixed(2).replace(".", ",")}
                      </p>

                      <div className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1 transition-colors shadow-sm">
                        <span>Comprar Agora</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Trust Section */}
      <section className="bg-slate-100 border-t border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">Garantia Incondicional de 30 Dias</h4>
            <p className="text-xs text-slate-500">Se não gostar do produto, devolvemos 100% do seu dinheiro sem burocracia.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <Truck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">Rastreamento Passo a Passo</h4>
            <p className="text-xs text-slate-500">Receba atualizações do seu pedido via WhatsApp e e-mail.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <Lock className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">Pagamento Seguro SSL</h4>
            <p className="text-xs text-slate-500">Seus dados protegidos por criptografia de ponta a ponta.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/politica-de-devolucao" className="hover:text-white transition-colors">Política de Devolução</Link>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-semibold">Compra 100% Protegida</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
