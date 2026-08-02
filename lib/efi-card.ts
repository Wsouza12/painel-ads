import https from "https";

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
    passphrase: "",
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

/**
 * Cria cobrança de Boleto via EFI Bank
 * Usa a API de cobranças com vencimento (cobv) para gerar boleto
 */
export async function createEfiBoletoCharge(
  token: string,
  valor: string,
  cpf: string,
  nome: string
): Promise<{ boletoUrl: string; codigoBarras: string; linhaDigitavel: string; txid: string }> {
  // Gerar txid único
  const txid = "bol" + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  
  const body = {
    calendario: { 
      dataDeVencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 dias
      validadeAposVencimento: 30 
    },
    valor: { original: Number(valor).toFixed(2) },
    chave: process.env.EFI_PIX_KEY || "",
    solicitacaoPagador: "Pagamento do Pedido",
    devedor: {
      cpf: cpf,
      nome: nome.substring(0, 200)
    }
  };

  const options: https.RequestOptions = {
    hostname: EFI_API_URL,
    port: 443,
    path: `/v2/cob`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    agent: getAgent(),
  };

  const result = await httpsRequest(options, body);
  
  // Retorna dados do boleto
  return {
    boletoUrl: result.loc?.location || `https://pix.api.efipay.com.br/v2/cobv/${txid}`,
    codigoBarras: result.codigoBarras || "",
    linhaDigitavel: result.linhaDigitavel || "",
    txid: result.txid || txid
  };
}

/**
 * Cria cobrança de Cartão de Crédito via EFI Bank
 * Nota: A API de cartão do EFI usa endpoint diferente
 */
export async function createEfiCardCharge(
  token: string,
  valor: string,
  cardData: {
    paymentToken: string;
  },
  customerInfo: { name: string; email: string; cpf: string; phone: string }
): Promise<{ chargeId: string; status: string; txid: string }> {
  // Na API EFI, primeiro criamos a cobrança, depois associamos o pagamento
  const chargeBody = {
    items: [{
      name: "Pedido Loja",
      value: Math.round(Number(valor) * 100), // EFI espera em centavos
      amount: 1
    }]
  };

  // Passo 1: Criar cobrança
  const chargeOptions: https.RequestOptions = {
    hostname: "api.efipay.com.br", // URL base de produção API EFI
    port: 443,
    path: "/v1/charge",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    agent: getAgent(),
  };

  const charge = await httpsRequest(chargeOptions, chargeBody);
  const chargeId = charge?.data?.charge_id;

  if (!chargeId) {
    throw new Error("Falha ao criar cobrança no EFI");
  }

  // Passo 2: Pagar com cartão
  const payBody = {
    payment: {
      credit_card: {
        customer: {
          name: customerInfo.name,
          cpf: customerInfo.cpf.replace(/\D/g, ""),
          email: customerInfo.email,
          phone_number: customerInfo.phone.replace(/\D/g, ""),
        },
        installments: 1,
        payment_token: cardData.paymentToken, // Token gerado no frontend
        billing_address: {
          street: "Rua do Cliente",
          number: "123",
          neighborhood: "Bairro",
          zipcode: "01001000",
          city: "São Paulo",
          state: "SP"
        }
      }
    }
  };

  const payOptions: https.RequestOptions = {
    hostname: "api.efipay.com.br", // URL base de produção API EFI
    port: 443,
    path: `/v1/charge/${chargeId}/pay`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    agent: getAgent(),
  };

  const payResult = await httpsRequest(payOptions, payBody);

  return {
    chargeId: String(chargeId),
    status: payResult?.data?.status || "waiting",
    txid: String(chargeId)
  };
}
