import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const { title, price, originalDescription } = await request.json();
    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      return NextResponse.json({ error: "Faltando GROQ_API_KEY no painel" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: groqKey });

    const systemPrompt = `Você é um copywriter agressivo e focado em alta conversão para o Mercado Livre.
Sua tarefa é criar uma descrição MATADORA de produto, focada em SEO (palavras-chave), quebra de objeções e urgência.
Estilo: Agressivo, com escassez, focando muito na dor do cliente e na solução rápida.
Regras da descrição do Mercado Livre:
- Não pode usar formatação HTML (apenas texto puro, maiúsculas e quebras de linha).
- Tem que ser persuasiva e focar nos benefícios logo na primeira linha.
- Retorne APENAS o texto puro da descrição, sem JSON, sem aspas e sem conversa. Comece direto com o título em MAIÚSCULAS.`;

    const groqResponse = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Produto: ${title}\nPreço: R$ ${price}\n\nDescrição Original (pode ser fraca, use como base para os dados técnicos):\n${originalDescription || "Nenhuma descrição informada."}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const optimizedDescription = groqResponse.choices[0]?.message?.content;
    if (!optimizedDescription) throw new Error("Groq retornou vazio.");

    return NextResponse.json({
      success: true,
      optimizedDescription: optimizedDescription.trim(),
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
