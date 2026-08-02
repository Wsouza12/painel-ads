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

export async function getEfiV1Token(): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  
  const options: https.RequestOptions = {
    hostname: "api.efipay.com.br", // URL correta para API v1 (Boleto/Cartão)
    port: 443,
    path: "/v1/authorize", // Endpoint correto para v1
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    }
    // NOTA: A API v1 não utiliza certificado mTLS, portanto não passamos o 'agent' aqui.
  };

  const response = await httpsRequest(options, { grant_type: "client_credentials" });
  return response.access_token;
}

/**
 * Cria cobrança de Boleto via EFI Bank
 * Usa a API de cobranças (v1/charge) para gerar boleto real
 */
export async function createEfiBoletoCharge(
  token: string, // Espera token da v1
  valor: string,
  customerInfo: { name: string; email: string; cpf: string; phone: string; zipCode: string; address: string; number: string; neighborhood: string; city: string; state: string }
): Promise<{ boletoUrl: string; codigoBarras: string; linhaDigitavel: string; txid: string }> {
  
  // Passo 1: Criar cobrança
  const chargeBody = {
    items: [{
      name: "Pedido Loja",
      value: Math.round(Number(valor) * 100),
      amount: 1
    }]
  };

  const chargeOptions: https.RequestOptions = {
    hostname: "api.efipay.com.br",
    port: 443,
    path: "/v1/charge",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const charge = await httpsRequest(chargeOptions, chargeBody);
  const chargeId = charge?.data?.charge_id;

  if (!chargeId) {
    throw new Error("Falha ao criar cobrança de boleto no EFI");
  }

  // Passo 2: Gerar Boleto
  const payBody = {
    payment: {
      banking_billet: {
        expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 dias
        customer: {
          name: customerInfo.name || "Cliente Não Informado",
          email: customerInfo.email || "cliente@email.com",
          cpf: customerInfo.cpf?.replace(/\D/g, "") || "00000000000",
          phone_number: customerInfo.phone?.replace(/\D/g, "") || "11999999999",
          address: {
            street: customerInfo.address || "Rua Principal",
            number: customerInfo.number || "S/N",
            neighborhood: customerInfo.neighborhood || "Centro",
            zipcode: customerInfo.zipCode?.replace(/\D/g, "") || "01001000",
            city: customerInfo.city || "São Paulo",
            state: customerInfo.state || "SP"
          }
        }
      }
    }
  };

  const payOptions: https.RequestOptions = {
    hostname: "api.efipay.com.br",
    port: 443,
    path: `/v1/charge/${chargeId}/pay`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const result = await httpsRequest(payOptions, payBody);
  
  const boletoData = result?.data;
  if (!boletoData || !boletoData.pdf) {
    throw new Error("Falha ao gerar o boleto bancário");
  }

  return {
    boletoUrl: boletoData.pdf.charge || boletoData.link || "",
    codigoBarras: boletoData.barcode || "",
    linhaDigitavel: boletoData.barcode || "", // Algumas vezes a API retorna barcode como linha digitável ou tem um campo especifico
    txid: chargeId.toString()
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
  customerInfo: { name: string; email: string; cpf: string; phone: string; zipCode: string; address: string; number: string; neighborhood: string; city: string; state: string }
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
          street: customerInfo.address || "Rua do Cliente",
          number: customerInfo.number || "123",
          neighborhood: customerInfo.neighborhood || "Bairro",
          zipcode: customerInfo.zipCode?.replace(/\D/g, "") || "01001000",
          city: customerInfo.city || "São Paulo",
          state: customerInfo.state || "SP"
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
  };

  const payResult = await httpsRequest(payOptions, payBody);

  return {
    chargeId: String(chargeId),
    status: payResult?.data?.status || "waiting",
    txid: String(chargeId)
  };
}
