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
          content: "Você é um diretor de arte de varejo (estilo Casas Bahia / Havan). Gere textos de ALTO IMPACTO para um 'Card de Oferta'. Retorne ESTRITAMENTE um JSON com: 'headline' (NOME DO PRODUTO, máx 4 palavras, caixa alta), 'urgency' (Ex: PROMOÇÃO DA SEMANA, OFERTA RELÂMPAGO, máx 3 palavras), 'benefits' (Array com exatas 3 strings muito curtas destacando recursos, máx 4 palavras cada), 'themeColor' (COR VIBRANTE DE VAREJO em HEX, ex: '#00d2ff', vermelho, amarelo, cyan)."
        },
        {
          role: "user",
          content: `Crie a copy de varejo para o produto: ${productTitle}. Preço original: ${productPrice}.`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    let copy = {
      headline: productTitle.substring(0, 20).toUpperCase(),
      urgency: "PROMOÇÃO DA SEMANA",
      benefits: [
        "ALTA QUALIDADE",
        "ENVIO IMEDIATO",
        "PREÇO IMBATÍVEL"
      ],
      themeColor: "#00d2ff" // vibrant cyan default
    };

    try {
      const result = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
      if (result.headline) copy.headline = result.headline;
      if (result.urgency) copy.urgency = result.urgency;
      if (result.themeColor) copy.themeColor = result.themeColor;
      if (result.benefits && Array.isArray(result.benefits)) {
        copy.benefits = result.benefits.slice(0, 3);
      }
    } catch (e) {
      console.error("Failed to parse Groq response", e);
    }

    let imageUrl = product.custom_image_url || product.pictures?.[0]?.secure_url || product.pictures?.[0]?.url || product.thumbnail || "https://placehold.co/600x600.png";
    if (typeof imageUrl !== 'string') {
      imageUrl = "https://placehold.co/600x600.png";
    }
    if (imageUrl.startsWith("http://")) {
      imageUrl = imageUrl.replace("http://", "https://");
    }

    // Use Satori (via ImageResponse) to compose the Retail Offer Card ad
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '1080px',
            height: '1080px',
            background: copy.themeColor,
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Fundo Vibrante de Varejo com Textura/Luzes (Simuladas por Gradiente) */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: `radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 70%)`,
              display: 'flex',
            }}
          />

          {/* Top Banner (Promoção) */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '0',
              width: '1080px',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 30,
            }}
          >
            <div
              style={{
                background: '#000000',
                color: '#ffffff',
                padding: '20px 50px',
                fontSize: '52px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textAlign: 'center',
                boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
              }}
            >
              {copy.urgency}
            </div>
          </div>

          {/* Imagem do Produto no Centro/Esquerda */}
          <div
            style={{
              position: 'absolute',
              top: '200px',
              left: '50px',
              width: '750px',
              height: '750px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            {/* Como muitas imagens do ML tem fundo branco, colocamos em um círculo ou deixamos mesclar. 
                Neste estilo, a imagem fica "solta". */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Product"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          </div>

          {/* Floating Badges (Benefícios) */}
          {/* Benefit 1: Top Left */}
          {copy.benefits[0] && (
            <div
              style={{
                position: 'absolute',
                top: '250px',
                left: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                zIndex: 20,
              }}
            >
              <div style={{ color: '#000', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '15px' }}>
                {copy.benefits[0]}
              </div>
            </div>
          )}

          {/* Benefit 2: Top Right */}
          {copy.benefits[1] && (
            <div
              style={{
                position: 'absolute',
                top: '320px',
                right: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                zIndex: 20,
              }}
            >
              <div style={{ color: '#000', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '15px' }}>
                {copy.benefits[1]}
              </div>
            </div>
          )}

          {/* Benefit 3: Middle Right */}
          {copy.benefits[2] && (
            <div
              style={{
                position: 'absolute',
                top: '550px',
                right: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                zIndex: 20,
              }}
            >
              <div style={{ color: '#000', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '15px' }}>
                {copy.benefits[2]}
              </div>
            </div>
          )}

          {/* Bloco de Preço Gigante (Bottom Right) */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              background: '#000000',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              padding: '40px 60px',
              borderTopLeftRadius: '40px',
              zIndex: 30,
              minWidth: '500px',
            }}
          >
            {/* Nome do Produto */}
            <div
              style={{
                fontSize: '32px',
                fontWeight: '600',
                textTransform: 'uppercase',
                marginBottom: '10px',
                color: '#e2e8f0',
                maxWidth: '450px',
              }}
            >
              {copy.headline}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold', marginRight: '15px', paddingBottom: '15px' }}>
                POR<br/>APENAS
              </span>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '50px', fontWeight: '900', marginTop: '10px' }}>R$</span>
                <span style={{ fontSize: '130px', fontWeight: '900', lineHeight: 0.8 }}>
                  {Math.floor(productPrice)}
                </span>
                <span style={{ fontSize: '50px', fontWeight: '900', marginTop: '10px' }}>
                  ,{((productPrice % 1) * 100).toFixed(0).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
