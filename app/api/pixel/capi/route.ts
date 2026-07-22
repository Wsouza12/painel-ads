import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, eventId, sourceUrl, userAgent, clientIp, fbc, fbp, contentIds, value, currency, customData } = body;

    const PIXEL_ID = process.env.META_PIXEL_ID;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn("CAPI: Missing META_PIXEL_ID or META_ACCESS_TOKEN. Event ignored.");
      return NextResponse.json({ error: "Missing config" }, { status: 500 });
    }

    const eventTime = Math.floor(Date.now() / 1000);
    
    // Extrai UTMs se vierem encapsuladas dentro de customData
    const utm_source = customData?.utm_source || body.customData?.utm_source || null;
    const utm_campaign = customData?.utm_campaign || body.customData?.utm_campaign || null;
    const product_id = contentIds?.[0] || null;

    // 1. Logar no banco de dados para Analytics (Fire and forget, não trava a requisição)
    supabaseAdmin.from("pixel_events_log").insert({
      event_id: eventId,
      event_name: eventName,
      product_id: product_id,
      value: value || null,
      utm_source: utm_source,
      utm_campaign: utm_campaign,
    }).catch(err => console.error("Erro ao salvar log de evento:", err));

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          event_source_url: sourceUrl,
          action_source: "website",
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            fbc: fbc || undefined,
            fbp: fbp || undefined,
          },
          custom_data: {
            content_ids: contentIds,
            content_type: "product",
            value: value,
            currency: currency || "BRL",
            utm_source: utm_source,
            utm_campaign: utm_campaign,
          },
        },
      ],
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: payload.data,
        access_token: ACCESS_TOKEN,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("CAPI Error:", result);
      return NextResponse.json({ error: result.error?.message || "CAPI error" }, { status: response.status });
    }

    return NextResponse.json({ success: true, fbResponse: result });
  } catch (error: any) {
    console.error("CAPI Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
