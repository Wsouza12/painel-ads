import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getEfiToken, createEfiCharge, getEfiQrCode } from "@/lib/efi";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, customer, paymentMethod, storeSlug } = body;

    if (!product || !customer || !paymentMethod) {
      return NextResponse.json({ success: false, message: "Dados incompletos" }, { status: 400 });
    }

    const cleanCpf = customer.cpf.replace(/\D/g, "");
    
    // 1. Criar ou Buscar Cliente
    let customerId = "";
    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("cpf", cleanCpf)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Atualizar dados do cliente caso tenham mudado
      await supabaseAdmin.from("customers").update({
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      }).eq("id", customerId);
    } else {
      const { data: newCustomer, error: customerErr } = await supabaseAdmin
        .from("customers")
        .insert({
          name: customer.name,
          cpf: cleanCpf,
          phone: customer.phone,
          email: customer.email
        })
        .select()
        .single();
        
      if (customerErr) throw new Error("Erro ao criar cliente: " + customerErr.message);
      customerId = newCustomer.id;
    }

    // 2. Criar Pedido no BD (Status Inicial: aguardando_pagamento)
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customerId,
        ml_item_id: product.ml_item_id,
        product_title: product.title,
        amount: product.price,
        status: "aguardando_pagamento",
        payment_method: paymentMethod,
        address_json: {
          zipCode: customer.zipCode,
          address: customer.address,
          number: customer.number
        }
      })
      .select()
      .single();

    if (orderErr) throw new Error("Erro ao criar pedido: " + orderErr.message);

    // 3. Processar Pagamento via EFI Bank
    let pixCopyPaste = "";
    let qrCodeBase64 = "";
    let efiTxid = "";

    if (paymentMethod === "pix") {
      try {
        if (process.env.EFI_CLIENT_ID && process.env.EFI_CERT_BASE64) {
          const token = await getEfiToken();
          const cobranca = await createEfiCharge(token, product.price, cleanCpf, customer.name);
          
          if (cobranca && cobranca.loc && cobranca.loc.id) {
            efiTxid = cobranca.txid; // ID interno da cobrança no EFI
            const qrCodeData = await getEfiQrCode(token, cobranca.loc.id);
            pixCopyPaste = qrCodeData.qrcode || "";
            qrCodeBase64 = qrCodeData.imagemQrcode ? qrCodeData.imagemQrcode.replace("data:image/png;base64,", "") : "";
            
            // Update order with efi_txid
            await supabaseAdmin.from("orders").update({ efi_txid: efiTxid }).eq("id", order.id);
          }
        }
      } catch (e: any) {
        console.error("Erro EFI Bank PIX:", e.message || e);
        // Fallback PIX
        pixCopyPaste = `00020126580014br.gov.bcb.pix0136${order.id.replace(/-/g,'').substring(0,25)}520400005303986540${Number(product.price).toFixed(2)}5802BR5915LOJA_PROFISSIONAL6009SAO_PAULO62070503***6304`;
      }
    } else if (paymentMethod === "boleto") {
      // TODO: Implementar Boleto EFI
      return NextResponse.json({ success: false, message: "Boleto em desenvolvimento" }, { status: 400 });
    } else if (paymentMethod === "credit_card") {
      // TODO: Implementar Cartão EFI
      return NextResponse.json({ success: false, message: "Cartão de Crédito em desenvolvimento" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      pixCopyPaste,
      qrCodeBase64
    });

  } catch (error: any) {
    console.error("Checkout Process Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
