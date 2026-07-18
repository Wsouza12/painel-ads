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
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um mestre em copywriting de resposta direta. Gere textos CURTOS para um anúncio no Facebook Ads. O formato de resposta deve ser ESTRITAMENTE um JSON com as seguintes chaves: 'headline' (TÍTULO DE IMPACTO, máx 5 palavras), 'subheadline' (ARGUMENTO PRINCIPAL, máx 8 palavras), 'urgency' (ESCASSEZ/PROMOÇÃO, máx 4 palavras), 'themeColor' (COR PREDOMINANTE em HEX, ex: '#FF0000', escolha cores luxuosas que combinem com a venda). Não inclua NENHUM texto extra fora do JSON."
        },
        {
          role: "user",
          content: `Crie a copy para o produto: ${product.title}. Preço original: ${product.price}.`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    let copy = {
      headline: product.title.substring(0, 20),
      subheadline: "Aproveite esta oferta exclusiva",
      urgency: "Compre agora",
      themeColor: "#8b5cf6" // default purple
    };

    try {
      const result = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
      if (result.headline) copy.headline = result.headline;
      if (result.subheadline) copy.subheadline = result.subheadline;
      if (result.urgency) copy.urgency = result.urgency;
      if (result.themeColor) copy.themeColor = result.themeColor;
    } catch (e) {
      console.error("Failed to parse Groq response", e);
    }

    const imageUrl = product.pictures?.[0] || product.thumbnail;

    // Use Satori (via ImageResponse) to compose the ad
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '1080px',
            height: '1080px',
            background: `linear-gradient(135deg, #111111 0%, ${copy.themeColor}33 50%, #000000 100%)`,
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Fundo abstrato / Luz */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${copy.themeColor}88 0%, transparent 60%)`,
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              left: '-10%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${copy.themeColor}55 0%, transparent 60%)`,
              filter: 'blur(80px)',
            }}
          />

          {/* Títulos / Copy Superior */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '80px',
              zIndex: 10,
              flex: 1,
            }}
          >
            <div
              style={{
                background: copy.themeColor,
                color: 'white',
                padding: '10px 24px',
                borderRadius: '100px',
                fontSize: '32px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                alignSelf: 'flex-start',
                marginBottom: '30px',
                letterSpacing: '2px',
              }}
            >
              {copy.urgency}
            </div>
            
            <h1
              style={{
                fontSize: '96px',
                fontWeight: '900',
                color: 'white',
                lineHeight: 1.1,
                margin: 0,
                textShadow: '0 10px 20px rgba(0,0,0,0.5)',
                textTransform: 'uppercase',
                maxWidth: '900px',
              }}
            >
              {copy.headline}
            </h1>
            
            <p
              style={{
                fontSize: '42px',
                color: '#e5e5e5',
                marginTop: '30px',
                maxWidth: '800px',
                lineHeight: 1.3,
                textShadow: '0 5px 10px rgba(0,0,0,0.5)',
              }}
            >
              {copy.subheadline}
            </p>
          </div>

          {/* Produto (Imagem Centralizada e Grande) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              bottom: '100px',
              right: '80px',
              width: '600px',
              height: '600px',
              zIndex: 20,
            }}
          >
            {/* Como a foto original costuma ter fundo branco, vamos colocar ela dentro de uma moldura premium para disfarçar o fundo branco de forma elegante */}
            <div
              style={{
                display: 'flex',
                background: 'white',
                padding: '20px',
                borderRadius: '30px',
                boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 40px ${copy.themeColor}44`,
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
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
          </div>

          {/* Sêlo de Qualidade / Preço */}
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '80px',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(0,0,0,0.6)',
              padding: '30px 40px',
              borderRadius: '24px',
              border: '2px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 30,
            }}
          >
            <span style={{ color: '#aaa', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>Apenas hoje</span>
            <span style={{ color: 'white', fontSize: '64px', fontWeight: 'bold' }}>R$ {product.price.toFixed(2)}</span>
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
