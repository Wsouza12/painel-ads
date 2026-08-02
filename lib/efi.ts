import https from "https";

// Carrega as variáveis de ambiente
const clientId = process.env.EFI_CLIENT_ID || "";
const clientSecret = process.env.EFI_CLIENT_SECRET || "";
const certBase64 = process.env.EFI_CERT_BASE64 || "";

const EFI_API_URL = "pix.api.efipay.com.br";

function getAgent() {
  if (!certBase64) {
    throw new Error("Certificado EFI não configurado");
  }
  const certBuffer = Buffer.from(certBase64, "base64");
  return new https.Agent({
    pfx: certBuffer,
    passphrase: "", // Geralmente não tem senha, ou é vazia
  });
}

function httpsRequest(options: https.RequestOptions, bodyData?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const json = data ? JSON.parse(data) : {};
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

export async function getEfiToken(): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  
  const options: https.RequestOptions = {
    hostname: EFI_API_URL,
    port: 443,
    path: "/oauth/token",
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    agent: getAgent(),
  };

  const response = await httpsRequest(options, { grant_type: "client_credentials" });
  return response.access_token;
}

export async function createEfiCharge(token: string, valor: string, cpf: string, nome: string): Promise<any> {
  const pixKey = process.env.EFI_PIX_KEY || "";
  
  const body = {
    calendario: { expiracao: 3600 },
    valor: { original: Number(valor).toFixed(2) },
    chave: pixKey,
    solicitacaoPagador: "Pagamento do Pedido",
    devedor: {
      cpf: cpf,
      nome: nome.substring(0, 200)
    }
  };

  const options: https.RequestOptions = {
    hostname: EFI_API_URL,
    port: 443,
    path: "/v2/cob",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    agent: getAgent(),
  };

  return await httpsRequest(options, body);
}

export async function getEfiQrCode(token: string, locId: number): Promise<{ qrcode: string; imagemQrcode: string }> {
  const options: https.RequestOptions = {
    hostname: EFI_API_URL,
    port: 443,
    path: `/v2/loc/${locId}/qrcode`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    agent: getAgent(),
  };

  return await httpsRequest(options);
}
