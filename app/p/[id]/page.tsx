import { supabaseAdmin } from "@/lib/supabase";
import { getDescription } from "@/lib/ml";
import { notFound } from "next/navigation";
import PixelTracker from "./PixelTracker";
import BuyButton from "./BuyButton";
import { ShieldCheck, Truck, Star, CreditCard } from "lucide-react";

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
  
  // 4. ML Description (We fetch on demand, or we could just not show it to keep the page short and focused on the button)
  let description = "Descrição completa no site oficial do Mercado Livre.";
  try {
    const fetchedDesc = await getDescription(product.ml_item_id);
    if (fetchedDesc) {
      // Truncate if too long to keep the landing page clean
      description = fetchedDesc.length > 300 ? fetchedDesc.substring(0, 300) + "..." : fetchedDesc;
    }
  } catch (e) {
    // ignore
  }

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col max-w-md mx-auto shadow-xl relative pb-24">
      {connection?.meta_pixel_id && <PixelTracker pixelId={connection.meta_pixel_id} />}

      {/* Cabeçalho Trust */}
      <div className="bg-[#FFE600] text-black text-center py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm relative z-10">
        <ShieldCheck size={14} />
        Site Oficial - Compra Garantida Mercado Livre
      </div>

      {/* Imagem do Produto */}
      <div className="bg-white w-full aspect-square relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 font-semibold">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          Top Avaliações
        </div>
      </div>

      {/* Informações */}
      <div className="p-4 bg-white space-y-4">
        <h1 className="text-xl font-bold text-neutral-900 leading-tight">
          {title}
        </h1>

        <div className="space-y-1">
          <p className="text-sm text-neutral-400 line-through">
            R$ {oldPrice.toFixed(2).replace(".", ",")}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-extrabold text-neutral-900">
              R$ {currentPrice.toFixed(2).replace(".", ",")}
            </p>
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
              OFERTA
            </span>
          </div>
          <p className="text-green-600 font-semibold text-sm">
            em até 12x sem juros no cartão
          </p>
        </div>

        {/* Benefícios */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 p-2 rounded">
            <Truck size={16} className="text-green-600" />
            <span>Envio Rápido</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 p-2 rounded">
            <ShieldCheck size={16} className="text-blue-600" />
            <span>Compra Garantida</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 p-2 rounded col-span-2">
            <CreditCard size={16} className="text-neutral-500" />
            <span>Pagamento Seguro pelo Mercado Pago</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h2 className="font-bold text-neutral-900">Sobre este produto:</h2>
        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </div>

      {/* Botão Fixo no Rodapé */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 max-w-md mx-auto">
        <BuyButton permalink={product.original_permalink} />
      </div>
    </main>
  );
}
