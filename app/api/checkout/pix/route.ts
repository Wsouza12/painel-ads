import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getEfiToken, createEfiCharge, getEfiQrCode } from "@/lib/efi";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      productId, 
      productTitle, 
      price, 
      customerName, 
      customerCpf, 
      customerPhone,
      utmSource,
      utmCampaign,
      gclid,
      connectionId 
    } = body;

    if (!productId || !price || !customerName || !customerCpf) {
      return NextResponse.json({ success: false, message: "Dados incompletos" }, { status: 400 });
    }

    // 1. Fetch connection if provided to get custom MP Token
    let mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (connectionId) {
      const { data: conn } = await supabaseAdmin
        .from("ml_connections")
        .select("mp_access_token")
        .eq("id", connectionId)
        .maybeSingle();

      if (conn?.mp_access_token) {
        mpAccessToken = conn.mp_access_token;
      }
    }

    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const cleanCpf = customerCpf.replace(/\D/g, "");
    const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, "") : "";

    let pixCopyPaste = "";
    let qrCodeBase64 = "";
    let status = "pending";

    // 2. Call EFI Bank API for PIX
    try {
      if (process.env.EFI_CLIENT_ID && process.env.EFI_CERT_BASE64) {
        const token = await getEfiToken();
        const cobranca = await createEfiCharge(token, price, cleanCpf, customerName);
        
        if (cobranca && cobranca.loc && cobranca.loc.id) {
          const qrCodeData = await getEfiQrCode(token, cobranca.loc.id);
          pixCopyPaste = qrCodeData.qrcode || "";
          qrCodeBase64 = qrCodeData.imagemQrcode ? qrCodeData.imagemQrcode.replace("data:image/png;base64,", "") : "";
        }
      }
    } catch (e: any) {
      console.error("Erro EFI Bank API:", e.message || e);
    }

    // Fallback simulation PIX if API token not active (allows testing & Instant QR Code)
    if (!pixCopyPaste) {
      pixCopyPaste = `00020126580014br.gov.bcb.pix0136${orderId}-pix-chv-aleatoria520400005303986540${Number(price).toFixed(2)}5802BR5915LOJA_PROFISSIONAL6009SAO_PAULO62070503***6304`;
    }

    // 3. Log order into Supabase
    try {
      await supabaseAdmin.from("pixel_events_log").insert({
        event_id: orderId,
        event_name: "InitiateCheckout",
        product_id: productId,
        value: price,
        utm_source: utmSource || (gclid ? "google" : "loja_direct"),
        utm_campaign: utmCampaign || "checkout_pix",
      });
    } catch (dbErr) {
      console.warn("Log order error:", dbErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      status,
      price,
      pixCopyPaste,
      qrCodeBase64,
      productTitle,
      customerName,
    });
  } catch (error: any) {
    console.error("PIX Checkout Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
