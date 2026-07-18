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
            height: '1350px', // Formato Vertical Facebook Ads
            background: '#ffffff', // Fundo branco minimalista
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Fundo com detalhes Apple-style */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              zIndex: 0,
            }}
          />
          
          {/* Elementos Luminosos MagSafe (Fundo Azul Suave) */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              right: '-10%',
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%',
              zIndex: 1,
            }}
          />

          {/* Selo Oferta Limitada (Topo Esquerdo) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
              top: '50px',
              left: '50px',
              background: '#ef4444',
              padding: '12px 24px',
              borderRadius: '8px',
              zIndex: 20,
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
            }}
          >
            <span style={{ fontSize: '28px', marginRight: '10px' }}>🔥</span>
            <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontStyle: 'italic' }}>
              OFERTA LIMITADA!
            </span>
          </div>

          {/* Header Texts */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              top: '140px',
              left: '50px',
              width: '55%',
              zIndex: 20,
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: '900',
                color: '#0f172a', // Dark blue/black
                lineHeight: 1.05,
                margin: 0,
                textTransform: 'uppercase',
                textShadow: '0 2px 10px rgba(255,255,255,0.8)'
              }}
            >
              {copy.headline}
            </h1>
            
            <p
              style={{
                fontSize: '32px',
                color: '#334155',
                marginTop: '25px',
                lineHeight: 1.3,
                fontWeight: '700',
              }}
            >
              {copy.subheadline}
            </p>
          </div>

          {/* Benefícios (Meio Esquerdo) */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'absolute',
              top: '500px',
              left: '50px',
              gap: '35px',
              zIndex: 20,
            }}
          >
            {copy.benefits.map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '28px',
                    background: '#0f172a',
                    marginRight: '25px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '28px', color: '#0f172a', fontWeight: '900', textTransform: 'uppercase' }}>
                    {benefit}
                  </span>
                  <span style={{ fontSize: '22px', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>
                    Alta performance garantida
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Imagem do Produto (Gigante, 70% da arte, Flutuando Direita) */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              right: '-5%',
              width: '850px',
              height: '850px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.15))',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Product"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Box de Preço e CTA (Rodapé Completo) */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '320px',
              display: 'flex',
              flexDirection: 'row',
              background: '#ef4444', // Vermelho vibrante
              padding: '0 50px',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 30,
              boxShadow: '0 -20px 50px rgba(239, 68, 68, 0.3)',
              borderTopRightRadius: '80px',
            }}
          >
            {/* Preços */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ color: '#fca5a5', fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  DE R$ {(productPrice * 1.6).toFixed(2)}
                </span>
              </div>
              <span style={{ color: '#ffffff', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '-5px' }}>
                POR APENAS
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ color: '#fef08a', fontSize: '48px', fontWeight: '900', marginTop: '15px', marginRight: '10px' }}>
                  R$
                </span>
                <span style={{ color: '#fef08a', fontSize: '110px', fontWeight: '900', lineHeight: 1 }}>
                  {Math.floor(productPrice)}
                </span>
                <span style={{ color: '#fef08a', fontSize: '48px', fontWeight: '900', marginTop: '15px' }}>
                  ,{((productPrice % 1) * 100).toFixed(0).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Botão de Ação CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0f172a', // Preto/Azul Escuro
                padding: '24px 48px',
                borderRadius: '100px',
                border: '4px solid rgba(255,255,255,0.2)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginRight: '16px' }}>
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ color: '#ffffff', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase' }}>
                GARANTA O SEU!
              </span>
            </div>
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
