import { supabaseAdmin } from "@/lib/supabase";
import { getDescription } from "@/lib/ml";
import { notFound } from "next/navigation";
import PixelTracker from "./PixelTracker";
import BuyButton from "./BuyButton";

export const revalidate = 3600; // Cache for 1 hour

export default async function ProductPage({ params }: { params: { id: string } }) {
  // 1. Fetch product
  const { data: product } = await supabaseAdmin
    .from("ml_products")
    .select("*")
    .eq("id", params.id)
    .single();

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

      {/* Imagem do Produto - estilo ML nativo */}
      <div className="bg-white w-full">
        <div className="relative aspect-square flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt={title} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
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

      {/* Descrição */}
      {description && (
        <div className="bg-white px-4 py-4 mb-2">
          <h2 className="text-base text-gray-900 mb-2">Descrição</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}

      {/* Fixa o botão comprar embaixo */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-3 pb-safe z-40">
        <BuyButton 
          permalink={product.original_permalink} 
          contentId={product.ml_item_id}
          value={currentPrice}
        />
      </div>
    </main>
  );
}
