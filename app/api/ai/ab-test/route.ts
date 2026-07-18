import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const { title, price } = await request.json();
    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      return NextResponse.json({ error: "Faltando GROQ_API_KEY no painel" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: groqKey });

    const systemPrompt = `Você é um Gerente de Marketing especializado em Testes A/B e ancoragem de preços para E-commerce.
Eu vou te passar um Produto e um Preço. Você precisa criar DUAS variantes de Título e Descrição para eu rodar um Teste A/B.

Variante A (Foco em Desconto/Oferta):
- Título focado em urgência, promoção, queima de estoque.
- Descrição focada em escassez, preço baixo, "não perca essa chance".

Variante B (Foco em Alto Valor Agregado/Premium):
- Título focado em qualidade premium, exclusividade, status, luxo ou solução definitiva. NUNCA mencione promoção ou preço no título B.
- Descrição focada nos benefícios reais, mudança de vida, durabilidade e status.

O Título deve ter no MÁXIMO 60 caracteres. A descrição no máximo 300 caracteres.
Retorne EXATAMENTE este formato JSON (não adicione aspas soltas, formatação markdown ou textos extras, apenas o JSON puro):
{
  "variantA": {
    "title": "titulo aqui",
    "desc": "descricao aqui",
    "image": "https://placehold.co/1080x1080/red/white?text=OFERTA+ESPECIAL"
  },
  "variantB": {
    "title": "titulo aqui",
    "desc": "descricao aqui",
    "image": "https://placehold.co/1080x1080/000000/d4af37?text=LINHA+PREMIUM"
  }
}
Lembre-se: O json precisa ser estritamente válido.`;

    const groqResponse = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Produto: ${title}\nPreço: R$ ${price}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = groqResponse.choices[0]?.message?.content;
    if (!content) throw new Error("Groq retornou vazio.");

    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
