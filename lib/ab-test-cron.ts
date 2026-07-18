import { supabaseAdmin } from "./supabase";
import { updateDescription, refreshAccessToken } from "./ml";

export async function rotateABTests() {
  console.log("[AB-TEST] Iniciando rotação de testes A/B no Mercado Livre...");

  // Busca todos os testes rodando
  const { data: tests, error } = await supabaseAdmin
    .from("ml_ab_tests")
    .select("*")
    .eq("status", "running");

  if (error || !tests) {
    console.error("[AB-TEST] Erro ao buscar testes:", error);
    return;
  }

  // Busca as conexões para ter os tokens do ML
  const { data: connections } = await supabaseAdmin
    .from("ml_connections")
    .select("*");

  if (!connections || connections.length === 0) return;
  const connection = connections[0];
  const { accessToken } = await refreshAccessToken(connection);

  for (const test of tests) {
    try {
      // Verifica se já passou 7 dias desde a última atualização (updated_at)
      const lastUpdate = new Date(test.updated_at).getTime();
      const now = new Date().getTime();
      const daysPassed = (now - lastUpdate) / (1000 * 60 * 60 * 24);

      // Vamos trocar a cada 7 dias.
      if (daysPassed >= 7) {
        console.log(`[AB-TEST] Rotacionando produto ${test.product_id}...`);

        // Busca o produto real para pegar o ML_ITEM_ID
        const { data: product } = await supabaseAdmin
          .from("ml_products")
          .select("ml_item_id")
          .eq("id", test.product_id)
          .single();

        if (!product) continue;

        // Precisamos saber se a variante atual lá no ML é a A ou a B.
        // Vamos buscar a descrição atual direto da API do ML
        const res = await fetch(`https://api.mercadolibre.com/items/${product.ml_item_id}/description`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!res.ok) continue;
        const currentData = await res.json();
        const currentDesc = currentData.plain_text || "";

        // Se a descrição atual for parecida com a Variante A, nós trocamos para a B.
        // Caso contrário, trocamos para a A.
        let newVariantDesc = "";
        
        if (currentDesc.includes(test.variant_a_desc.substring(0, 50))) {
          newVariantDesc = test.variant_b_desc;
          console.log(`[AB-TEST] Trocando de Variante A para B`);
        } else {
          newVariantDesc = test.variant_a_desc;
          console.log(`[AB-TEST] Trocando de Variante B para A`);
        }

        // Atualiza a descrição no ML
        await updateDescription(product.ml_item_id, accessToken, newVariantDesc);

        // Salva o momento da troca no banco para esperar mais 7 dias
        await supabaseAdmin
          .from("ml_ab_tests")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", test.id);
      }
    } catch (err) {
      console.error(`[AB-TEST] Falha ao rotacionar teste ${test.id}:`, err);
    }
  }
}
