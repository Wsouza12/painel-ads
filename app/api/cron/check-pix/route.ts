import { NextResponse } from "next/server";
import https from "https";
import { supabaseAdmin } from "@/lib/supabase";

const clientId = process.env.EFI_CLIENT_ID || "";
const clientSecret = process.env.EFI_CLIENT_SECRET || "";
const certBase64 = process.env.EFI_CERT_BASE64 || "";
const EFI_API_URL = "pix.api.efipay.com.br";

// Rota protegida por chave secreta para evitar execuções indesejadas
const CRON_SECRET = process.env.CRON_SECRET || "minha_chave_cron_segura_123";

function getAgent() {
  const certBuffer = Buffer.from(certBase64, "base64");
  return new https.Agent({
    pfx: certBuffer,
    passphrase: "",
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  if (searchParams.get("key") !== CRON_SECRET) {
    return NextResponse.json({ success: false, message: "Não autorizado" }, { status: 401 });
  }

  try {
    // 1. Buscar todos os pedidos aguardando PIX
    const { data: pendingOrders, error: dbError } = await supabaseAdmin
      .from("orders")
      .select("id, efi_txid")
      .eq("payment_method", "pix")
      .eq("status", "aguardando");

    if (dbError) throw dbError;
    if (!pendingOrders || pendingOrders.length === 0) {
      return NextResponse.json({ success: true, message: "Nenhum pedido pendente." });
    }

    console.log(`Verificando ${pendingOrders.length} pedidos PIX pendentes...`);

    // 2. Autenticar no EFI
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

    let updatedCount = 0;

    // 3. Verificar cada TXID
    for (const order of pendingOrders) {
      if (!order.efi_txid) continue;

      const cobData = await new Promise<any>((resolve, reject) => {
        const req = https.request({
          hostname: EFI_API_URL,
          port: 443,
          path: `/v2/cob/${order.efi_txid}`,
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

      if (cobData.status === "CONCLUIDA") {
        await supabaseAdmin.from("orders").update({ status: "pago" }).eq("id", order.id);
        updatedCount++;
        console.log(`Pedido ${order.id} marcado como pago!`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processamento concluído. ${updatedCount} pedidos atualizados.` 
    });
  } catch (error: any) {
    console.error("Erro no Cron PIX:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
