import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { title, price, originalImage } = await request.json();

    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!groqKey) {
      return NextResponse.json({ error: "Faltando GROQ_API_KEY no painel" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: groqKey });

    // 1. Usar o Groq para gerar o Título e o Prompt
    const systemPrompt = `Você é um Diretor de Arte Especialista em E-commerce (Amazon, Mercado Livre, Apple) e Copywriter de Alta Conversão.
Eu vou te passar um título de produto e o preço.
Sua tarefa é retornar APENAS um JSON válido contendo:
- "title": Um título curto (max 40 chars), focado no benefício e gatilho mental (ex: "Bicicleta Infantil: Promoção Exclusiva!").
- "imagePrompt": Um prompt em INGLÊS altamente detalhado para o DALL-E 3 gerar uma arte premium de alta conversão.
REGRAS OBRIGATÓRIAS PARA O IMAGEPROMPT (Traduza essas instruções para o inglês ao escrever o prompt):
1. Fundo moderno e minimalista, iluminação de estúdio, sombras suaves, muito espaço em branco. O produto deve ter foco total, recorte perfeito e ultra-realista.
2. Layout estilo infográfico contendo: Um Título chamativo no topo, um subtítulo curto, e 4 a 6 benefícios curtos acompanhados de ícones (ex: peça para escrever os textos exatos em português, como "ALTA DURABILIDADE", "PORTÁTIL", etc).
3. Adicione selos de confiança discretos (ex: "Garantia", "Envio Rápido").
4. Estilo visual de altíssima credibilidade, leitura rápida e forte impacto visual.
5. NUNCA adicione o preço na imagem. NUNCA adicione promoções falsas.`;

    const groqResponse = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Produto: ${title} | Preço: R$ ${price}` }
      ],
      model: "llama-3.3-70b-versatile", // Modelo ultra-moderno
      response_format: { type: "json_object" },
    });

    const content = groqResponse.choices[0]?.message?.content;
    if (!content) throw new Error("Groq retornou vazio.");

    const parsedContent = JSON.parse(content);
    const optimizedTitle = parsedContent.title;
    const imagePrompt = parsedContent.imagePrompt;

    let generatedImageUrl = "";

    // 2. Usar OpenAI DALL-E 3 para gerar a imagem (apenas se a chave estiver configurada)
    if (openaiKey) {
      const openai = new OpenAI({ apiKey: openaiKey });
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      generatedImageUrl = imageResponse?.data?.[0]?.url || "";
    }

    return NextResponse.json({
      success: true,
      optimizedTitle,
      generatedImageUrl,
      imagePrompt,
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
