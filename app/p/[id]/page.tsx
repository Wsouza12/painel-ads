import { supabaseAdmin } from "@/lib/supabase";
import { getDescription } from "@/lib/ml";
import { notFound } from "next/navigation";
import PixelTracker from "./PixelTracker";
import BuyButton from "./BuyButton";
import Scarcity from "./Scarcity";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  // 1. Fetch product (by UUID or by ml_item_id)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
  
  let product = null;
  if (isUuid) {
    const { data } = await supabaseAdmin.from("ml_products").select("*").eq("id", params.id).maybeSingle();
    product = data;
  }
  
  if (!product) {
    const { data } = await supabaseAdmin.from("ml_products").select("*").eq("ml_item_id", params.id).limit(1);
    if (data && data.length > 0) {
      product = data[0];
    }
  }

  if (!product) {
    return notFound();
  }

  // 2. Fetch connection to get Pixel ID
  const { data: connection } = await supabaseAdmin
    .from("ml_connections")
    .select("meta_pixel_id")
    .eq("id", product.connection_id)
    .single();

  // 3. Values
  const title = product.custom_title || product.original_title;
  const currentPrice = product.custom_price || product.original_price;
  
  // Create a fake old price if none exists (20% higher) for the mental anchor
  const oldPrice = product.custom_price && product.original_price > product.custom_price 
    ? product.original_price 
    : currentPrice * 1.2;

  const imageUrl = product.custom_image_url || product.original_image_url;
  
  // Discount percentage
  const discountPercent = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
  
  // Installments
  const installmentValue = (currentPrice / 12).toFixed(2).replace(".", ",");

  // 4. ML Description
  let description = "";
  try {
    const fetchedDesc = await getDescription(product.ml_item_id);
    if (fetchedDesc) {
      description = fetchedDesc.length > 400 ? fetchedDesc.substring(0, 400) + "..." : fetchedDesc;
    }
  } catch (e) {
    // ignore
  }

  return (
    <main className="min-h-screen bg-[#EBEBEB] flex flex-col max-w-md mx-auto relative pb-20">
      {connection?.meta_pixel_id && (
        <PixelTracker 
          pixelId={connection.meta_pixel_id} 
          contentId={product.ml_item_id}
          value={currentPrice}
          searchParams={searchParams}
        />
      )}

      {/* Cabeçalho ML */}
      <div className="bg-[#FFE600] px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <span className="text-sm text-gray-400">Buscar no Mercado Livre</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white px-4 py-2 text-xs text-[#3483FA]">
        &lt; Voltar ao listado
      </div>

      {/* Imagem ou Vídeo do Produto - estilo ML nativo */}
      <div className="bg-white w-full">
        {(product.custom_video_url || product.custom_video_url_square) ? (
          <div className="relative aspect-[9/16] max-h-[480px] w-full flex items-center justify-center p-2 bg-black overflow-hidden shadow-inner">
            <video 
              src={product.custom_video_url || product.custom_video_url_square} 
              controls 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="relative aspect-square flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imageUrl} 
              alt={title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 py-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3483FA]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* Seção de Preço - estilo ML */}
      <div className="bg-white px-4 pb-4 border-b border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Novo  |  +500 vendidos</p>
        
        <h1 className="text-sm text-gray-700 leading-snug mb-3">
          {title}
        </h1>

        <div className="space-y-0.5">
          <p className="text-xs text-gray-400 line-through">
            R$ {oldPrice.toFixed(2).replace(".", ",")}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-[28px] font-light text-gray-900">
              R$ {currentPrice.toFixed(2).replace(".", ",")}
            </p>
            <span className="text-sm font-semibold text-[#00A650]">
              {discountPercent}% OFF
            </span>
          </div>
          <p className="text-sm text-[#00A650]">
            em <span className="font-semibold">12x R$ {installmentValue}</span> sem juros
          </p>
        </div>
      </div>

      {/* Envio grátis */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00A650" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="2"/>
            <path d="M16 8h4l3 5v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <div>
            <p className="text-sm text-[#00A650] font-semibold">Chegará grátis</p>
            <p className="text-xs text-gray-500">Saiba os prazos de entrega</p>
          </div>
        </div>
      </div>

      {/* Devolução */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3483FA" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          <p className="text-sm text-[#3483FA]">Devolução grátis</p>
        </div>
      </div>

      {/* Estoque */}
      <div className="bg-white px-4 py-3 mb-2">
        <p className="text-sm text-gray-900 font-semibold">Estoque disponível</p>
        <div className="flex items-center gap-1 mt-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00A650" strokeWidth="3">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <p className="text-xs text-gray-500">Compra Garantida, receba o produto que está esperando ou devolvemos o dinheiro.</p>
        </div>
      </div>

      {/* Vendedor */}
      <div className="bg-white px-4 py-3 mb-2">
        <p className="text-xs text-gray-500 mb-1">Vendido por</p>
        <p className="text-sm text-[#3483FA] font-semibold">Loja Oficial</p>
        <div className="mt-2 flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#00A650]"></div>
            <span>MercadoLíder</span>
          </div>
          <span>+1000 vendas</span>
        </div>
      </div>

      {/* Scarcity Trigger (Gatilho de Escassez) */}
      <Scarcity productId={product.ml_item_id} />

      {/* Descrição */}
      {description && (
        <div className="bg-white px-4 py-4 mb-2">
          <h2 className="text-base text-gray-900 mb-2">Descrição</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}

      {/* Prova Social: Depoimentos */}
      <div className="bg-white px-4 py-4 mb-2">
        <h2 className="text-base text-gray-900 mb-4">Opiniões sobre o produto</h2>
        <div className="space-y-4">
          {/* Depoimento 1 */}
          <div>
            <div className="flex gap-1 text-[#3483FA] mb-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <p className="text-sm text-gray-700 font-medium mb-1">Excelente qualidade</p>
            <p className="text-sm text-gray-600 mb-1">Chegou super rápido, bem antes do prazo! O produto é de excelente qualidade e idêntico ao anúncio. Recomendo de olhos fechados.</p>
            <p className="text-xs text-gray-400">12 abr. 2024</p>
          </div>
          <div className="border-t border-gray-100"></div>
          
          {/* Depoimento 2 */}
          <div>
            <div className="flex gap-1 text-[#3483FA] mb-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <p className="text-sm text-gray-700 font-medium mb-1">Vale a pena</p>
            <p className="text-sm text-gray-600 mb-1">Fiquei com receio de comprar na internet, mas a loja passou muita confiança com o rastreio. Valeu cada centavo.</p>
            <p className="text-xs text-gray-400">28 mar. 2024</p>
          </div>
        </div>
      </div>

      {/* Rodapé LGPD e Trust */}
      <div className="px-4 py-8 bg-gray-50 text-center mb-20">
        <div className="flex justify-center items-center gap-4 text-gray-400 mb-6 grayscale opacity-50">
          <div className="h-6 w-9 border border-gray-300 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
          <div className="h-6 w-9 border border-gray-300 rounded flex items-center justify-center text-[10px] font-bold">MC</div>
          <div className="h-6 w-9 border border-gray-300 rounded flex items-center justify-center text-[10px] font-bold">PIX</div>
          <div className="h-6 w-9 border border-gray-300 rounded flex items-center justify-center text-[9px] font-bold">BOLETO</div>
        </div>
        
        <div className="text-[10px] text-gray-500 space-y-2 mb-4">
          <p className="font-bold text-gray-700">Sua Loja LTDA - CNPJ: 00.000.000/0001-00</p>
          <p>Rua Fictícia, 123 - Centro, São Paulo - SP</p>
          <p>contato@sualoja.com.br | Horário: Seg a Sex 09h às 18h</p>
        </div>

        <div className="flex items-center justify-center gap-3 text-[10px] font-medium text-[#3483FA]">
          <Link href="#" className="hover:underline">Privacidade</Link>
          <span className="text-gray-300">•</span>
          <Link href="#" className="hover:underline">Termos</Link>
          <span className="text-gray-300">•</span>
          <Link href="/politica-de-devolucao" className="hover:underline">Devoluções</Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-gray-400">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <span>Site 100% Seguro. Em conformidade com a LGPD.</span>
        </div>
      </div>

      {/* Fixa o botão comprar embaixo */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-3 pb-safe z-40">
        <BuyButton 
          permalink={product.original_permalink} 
          contentId={product.ml_item_id}
          value={currentPrice}
          searchParams={searchParams}
        />
      </div>
    </main>
  );
}
