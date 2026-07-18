import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge"; // Important for next/og

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return new Response("Missing productId", { status: 400 });
    }

    // Fetch product details
    const { data: product, error } = await supabaseAdmin
      .from("ml_products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error || !product) {
      return new Response("Product not found", { status: 404 });
    }

    // Initialize Groq to generate copy
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const productTitle = product.custom_title || product.original_title || "Produto";
    const productPrice = Number(product.custom_price || product.original_price || 0);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um mestre em copywriting de resposta direta. Gere textos CURTOS para um infográfico de produto de ALTA CONVERSÃO. O formato de resposta deve ser ESTRITAMENTE um JSON com as seguintes chaves: 'headline' (TÍTULO DE IMPACTO, máx 5 palavras, caixa alta), 'subheadline' (ARGUMENTO PRINCIPAL, máx 8 palavras), 'benefits' (Array com exatas 4 strings curtas de benefícios, cada uma com máx 6 palavras), 'urgency' (ESCASSEZ/PROMOÇÃO, máx 4 palavras). Não inclua NENHUM texto extra fora do JSON."
        },
        {
          role: "user",
          content: `Crie a copy para o produto: ${productTitle}. Preço original: ${productPrice}.`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    let copy = {
      headline: productTitle.substring(0, 20).toUpperCase(),
      subheadline: "Potência e Praticidade garantidas",
      urgency: "OFERTA ESPECIAL",
      benefits: [
        "Produto de Alta Qualidade",
        "Design Inovador e Prático",
        "Garantia de Satisfação",
        "Envio Rápido para Você"
      ]
    };

    try {
      const result = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
      if (result.headline) copy.headline = result.headline;
      if (result.subheadline) copy.subheadline = result.subheadline;
      if (result.urgency) copy.urgency = result.urgency;
      if (result.benefits && Array.isArray(result.benefits)) {
        copy.benefits = result.benefits.slice(0, 4);
      }
    } catch (e) {
      console.error("Failed to parse Groq response", e);
    }

    let imageUrl = product.original_image_url || "https://placehold.co/600x600.png";
    if (typeof imageUrl !== 'string') {
      imageUrl = "https://placehold.co/600x600.png";
    }
    if (imageUrl.startsWith("http://")) {
      imageUrl = imageUrl.replace("http://", "https://");
    }

    // Use Satori (via ImageResponse) to compose the clean infographic ad
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '1080px',
            height: '1080px',
            background: '#ffffff',
            flexDirection: 'row',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Esquerda: Copy e Benefícios */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '60px',
              width: '55%',
              position: 'relative',
              zIndex: 10,
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: '900',
                  color: '#0f172a',
                  lineHeight: 1.1,
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                {copy.headline}
              </h1>
              
              <p
                style={{
                  fontSize: '36px',
                  color: '#475569',
                  marginTop: '20px',
                  lineHeight: 1.2,
                  fontWeight: '500',
                }}
              >
                {copy.subheadline}
              </p>
            </div>

            {/* Lista de Benefícios */}
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '40px', gap: '30px' }}>
              {copy.benefits.map((benefit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Ícone de check moderno */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '24px',
                      background: '#10b981',
                      marginRight: '20px',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '28px', color: '#1e293b', fontWeight: 'bold' }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags de Confiança Rodapé Esquerdo */}
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: '60px', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                <span style={{ fontSize: '20px', color: '#0f172a', fontWeight: 'bold' }}>✅ GARANTIA DE QUALIDADE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                <span style={{ fontSize: '20px', color: '#0f172a', fontWeight: 'bold' }}>🚚 ENVIO RÁPIDO</span>
              </div>
            </div>
          </div>

          {/* Imagem do Produto Gigante (Ocupa todo o topo direito) */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '-20px',
              width: '550px',
              height: '550px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 5,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Product"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>

          {/* Selo de Preço / Urgência */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              right: '60px',
              display: 'flex',
              flexDirection: 'column',
              background: '#ef4444',
              padding: '30px 40px',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(239,68,68,0.4)',
              alignItems: 'flex-end',
              zIndex: 20,
            }}
          >
            <span style={{ color: '#fef08a', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', fontWeight: 'bold' }}>
              {copy.urgency}
            </span>
            <span style={{ color: '#ffffff', fontSize: '72px', fontWeight: '900' }}>
              R$ {productPrice.toFixed(2)}
            </span>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
