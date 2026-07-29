import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      eventName, 
      eventId, 
      sourceUrl, 
      userAgent, 
      clientIp, 
      fbc, 
      fbp, 
      contentIds, 
      value, 
      currency, 
      customData,
      connectionId,
      pixelId: customPixelId,
      accessToken: customAccessToken
    } = body;

    let PIXEL_ID = customPixelId || process.env.META_PIXEL_ID;
    let ACCESS_TOKEN = customAccessToken || process.env.META_ACCESS_TOKEN;

    // Fallback: If missing, look up from ml_connections
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      let query = supabaseAdmin.from("ml_connections").select("meta_pixel_id, meta_access_token");
      const { data: conn } = connectionId 
        ? await query.eq("id", connectionId).single()
        : await query.not("meta_pixel_id", "is", null).limit(1).single();

      if (conn) {
        PIXEL_ID = PIXEL_ID || conn.meta_pixel_id;
        ACCESS_TOKEN = ACCESS_TOKEN || conn.meta_access_token;
      }
    }

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn("CAPI: Missing META_PIXEL_ID or META_ACCESS_TOKEN. Event skipped gracefully.");
      return NextResponse.json({ success: false, reason: "Missing CAPI configuration" }, { status: 200 });
    }

    const eventTime = Math.floor(Date.now() / 1000);
    
    // Extract UTM parameters & Google Ads click IDs (gclid, gad_source, gbraid, wbraid)
    let utm_source = customData?.utm_source || body.utm_source || null;
    const utm_campaign = customData?.utm_campaign || body.utm_campaign || null;
    const refUrl = sourceUrl || request.headers.get("referer") || "";
    if (!utm_source && (refUrl.includes("gclid=") || refUrl.includes("gad_source=") || refUrl.includes("gbraid=") || refUrl.includes("wbraid=") || refUrl.toLowerCase().includes("google"))) {
      utm_source = "google";
    }
    const product_id = contentIds?.[0] || null;

    // Advanced IP & UserAgent Extraction for EMQ 9.0+
    const cfIp = request.headers.get("cf-connecting-ip");
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    let actualIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp);
    
    if (!actualIp || actualIp === "::1" || actualIp === "127.0.0.1") {
      actualIp = (clientIp && clientIp !== "0.0.0.0") ? clientIp : undefined;
    }

    const actualUserAgent = userAgent || request.headers.get("user-agent") || undefined;

    // 1. Log to database for Analytics
    await supabaseAdmin.from("pixel_events_log").insert({
      event_id: eventId,
      event_name: eventName,
      product_id: product_id,
      value: value || null,
      utm_source: utm_source,
      utm_campaign: utm_campaign,
    });

    const userDataPayload: Record<string, any> = {
      client_ip_address: actualIp,
      client_user_agent: actualUserAgent,
      fbc: fbc || undefined,
      fbp: fbp || undefined,
    };

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          event_source_url: sourceUrl || request.headers.get("referer") || "https://mercadoshops.up.railway.app",
          action_source: "website",
          user_data: userDataPayload,
          custom_data: {
            content_ids: contentIds || [],
            content_type: "product",
            value: value || undefined,
            currency: currency || "BRL",
            utm_source: utm_source || undefined,
            utm_campaign: utm_campaign || undefined,
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
