const https = require("https");

const clientId = process.env.EFI_CLIENT_ID;
const clientSecret = process.env.EFI_CLIENT_SECRET;
const certBase64 = process.env.EFI_CERT_BASE64;
const pixKey = process.env.EFI_PIX_KEY;
const webhookUrl = "https://mercadoshops.up.railway.app/api/webhook/efi";

const EFI_API_URL = "pix.api.efipay.com.br";

async function run() {
  console.log("Iniciando configuração automática de Webhook EFI...");

  if (!clientId || !clientSecret || !certBase64 || !pixKey) {
    console.error("Faltam variáveis de ambiente (EFI_CLIENT_ID, EFI_CLIENT_SECRET, EFI_CERT_BASE64, EFI_PIX_KEY)");
    process.exit(1);
  }

  const certBuffer = Buffer.from(certBase64, "base64");
  const agent = new https.Agent({
    pfx: certBuffer,
    passphrase: "",
  });

  const authBody = JSON.stringify({ grant_type: "client_credentials" });
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // 1. Obter Token
  console.log("Autenticando...");
  const tokenData = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: EFI_API_URL,
      port: 443,
      path: "/oauth/token",
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      agent,
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    });
    req.on("error", reject);
    req.write(authBody);
    req.end();
  });

  if (!tokenData.access_token) {
    console.error("Erro ao autenticar:", tokenData);
    process.exit(1);
  }

  // 2. Registrar Webhook
  console.log("Registrando webhook para a chave PIX:", pixKey);
  const webhookBody = JSON.stringify({
    webhookUrl: webhookUrl
  });

  const webhookResponse = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: EFI_API_URL,
      port: 443,
      path: `/v2/webhook/${pixKey}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      agent,
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch(e) {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    req.write(webhookBody);
    req.end();
  });

  if (webhookResponse.statusCode >= 200 && webhookResponse.statusCode < 300) {
    console.log("✅ Webhook PIX registrado com sucesso!");
    console.log("Resposta EFI:", webhookResponse.data);
  } else {
    console.error("❌ Falha ao registrar webhook:", webhookResponse.statusCode, webhookResponse.data);
  }
}

run();
