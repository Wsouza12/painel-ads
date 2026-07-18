import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, eventUrl, userData, customData } = body;

    // Em um sistema real multi-tenant, você pegaria o ID da loja/conexão pela URL.
    // Como é um app single-user, pegamos a primeira conexão ativa.
    const { data: connections } = await supabaseAdmin
      .from("ml_connections")
      .select("meta_pixel_id, meta_capi_token")
      .limit(1);

    const connection = connections?.[0];

    if (!connection?.meta_pixel_id || !connection?.meta_capi_token) {
      return NextResponse.json({ error: "Pixel ou Token não configurado" }, { status: 400 });
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: eventUrl,
          user_data: {
            client_ip_address: request.headers.get("x-forwarded-for") || "127.0.0.1",
            client_user_agent: request.headers.get("user-agent") || "",
            ...userData,
          },
          custom_data: customData || {},
        }
      ],
      // test_event_code: "TEST57064" // Use para testes no Gerenciador de Eventos
    };

    const url = `https://graph.facebook.com/v19.0/${connection.meta_pixel_id}/events?access_token=${connection.meta_capi_token}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error("Erro Meta CAPI:", responseData);
      return NextResponse.json({ error: "Erro ao enviar para o Meta", details: responseData }, { status: 500 });
    }

    return NextResponse.json({ success: true, meta_response: responseData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
