import { NextResponse } from "next/server";
import https from "https";
import { supabaseAdmin } from "@/lib/supabase";

const clientId = process.env.EFI_CLIENT_ID || "";
const clientSecret = process.env.EFI_CLIENT_SECRET || "";
const certBase64 = process.env.EFI_CERT_BASE64 || "";
const EFI_API_URL = "pix.api.efipay.com.br";

function getAgent() {
  const certBuffer = Buffer.from(certBase64, "base64");
  return new https.Agent({
    pfx: certBuffer,
    passphrase: "",
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txid = searchParams.get("txid");

  if (!txid) {
    return NextResponse.json({ success: false, message: "txid is required" }, { status: 400 });
  }

  try {
    // 1. Obter Token EFI
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenData = await new Promise<any>((resolve, reject) => {
      const req = https.request({
        hostname: EFI_API_URL,
        port: 443,
        path: "/oauth/token",
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
        agent: getAgent(),
      }, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(JSON.parse(data)));
      });
      req.on("error", reject);
      req.write(JSON.stringify({ grant_type: "client_credentials" }));
      req.end();
    });

    if (!tokenData.access_token) throw new Error("Falha na autenticação EFI");

    // 2. Consultar Status do Cob (PIX)
    const cobData = await new Promise<any>((resolve, reject) => {
      const req = https.request({
        hostname: EFI_API_URL,
        port: 443,
        path: `/v2/cob/${txid}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        agent: getAgent(),
      }, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(JSON.parse(data)));
      });
      req.on("error", reject);
      req.end();
    });

    // CONCLUIDA = Pago
    if (cobData.status === "CONCLUIDA") {
      // Atualizar banco de dados
      await supabaseAdmin.from("orders").update({ status: "pago" }).eq("efi_txid", txid);
      return NextResponse.json({ success: true, status: "pago" });
    }

    return NextResponse.json({ success: true, status: "aguardando" });
  } catch (error: any) {
    console.error("Erro ao verificar status do PIX:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
