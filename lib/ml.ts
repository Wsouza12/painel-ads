import { supabaseAdmin, type MlConnection } from "./supabase";

const ML_API = "https://api.mercadolibre.com";

export type MlItem = {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  condition: string;
  status: string;
  permalink: string;
  thumbnail: string;
  pictures?: { secure_url: string }[];
  attributes?: { id: string; value_name: string | null }[];
};

/**
 * Renova o access_token via refresh_token e PERSISTE o novo refresh_token
 * no banco (o ML rotaciona a cada uso — se não salvar, o próximo sync falha).
 */
export async function refreshAccessToken(connection: MlConnection) {
  const res = await fetch(`${ML_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: connection.client_id,
      client_secret: connection.client_secret,
      refresh_token: connection.refresh_token,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao renovar token ML: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await supabaseAdmin
    .from("ml_connections")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token, // sempre salva o novo
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connection.id);

  return { accessToken: data.access_token as string, userId: data.user_id as number };
}

export async function getAllItemIds(sellerId: number, accessToken: string) {
  const ids: string[] = [];
  let scrollId: string | undefined;

  while (true) {
    const url = new URL(`${ML_API}/users/${sellerId}/items/search`);
    url.searchParams.set("search_type", "scan");
    url.searchParams.set("status", "active");
    url.searchParams.set("limit", "100");
    if (scrollId) url.searchParams.set("scroll_id", scrollId);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error(`Erro ao listar itens: ${res.status} ${await res.text()}`);

    const data = await res.json();
    ids.push(...data.results);
    scrollId = data.scroll_id;

    if (!data.results.length || ids.length >= (data.paging?.total ?? 0)) break;
  }

  return ids;
}

export async function getItemsDetails(ids: string[], accessToken: string) {
  const items: MlItem[] = [];

  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    const res = await fetch(`${ML_API}/items?ids=${chunk.join(",")}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Erro ao buscar detalhes: ${res.status} ${await res.text()}`);

    const data = await res.json();
    for (const entry of data) {
      if (entry.code === 200) items.push(entry.body);
    }
    await sleep(150);
  }

  return items;
}

export async function getDescription(itemId: string, accessToken: string) {
  try {
    const res = await fetch(`${ML_API}/items/${itemId}/description`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return "";
    const data = await res.json();
    return (data.plain_text || "").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function updateDescription(itemId: string, accessToken: string, text: string) {
  const res = await fetch(`${ML_API}/items/${itemId}/description`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ plain_text: text }),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    
    // Tratamento amigável para anúncios de Catálogo
    if (errorMsg.includes("catalog listing item")) {
      throw new Error(
        "Este produto é um 'Anúncio de Catálogo' do Mercado Livre. O Mercado Livre não permite que vendedores alterem a descrição de produtos de Catálogo, pois a página do produto é controlada por eles. Apenas anúncios tradicionais podem ter a descrição alterada!"
      );
    }
    
    throw new Error(`Erro ao atualizar descrição: ${res.status} ${errorMsg}`);
  }

  return true;
}
