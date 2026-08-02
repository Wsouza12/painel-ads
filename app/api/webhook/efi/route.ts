import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Webhook EFI recebido:", JSON.stringify(body));

    // A EFI Bank envia um array de PIX recebidos (pode ter mais de um num disparo)
    if (body && body.pix && Array.isArray(body.pix)) {
      for (const pix of body.pix) {
        const txid = pix.txid;
        
        if (txid) {
          // Atualizar o status do pedido no banco de dados para "pago"
          const { error } = await supabaseAdmin
            .from("orders")
            .update({ status: "pago" })
            .eq("efi_txid", txid);

          if (error) {
            console.error(`Erro ao atualizar pedido com txid ${txid}:`, error);
          } else {
            console.log(`Pedido com txid ${txid} atualizado para pago com sucesso.`);
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processado" }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no Webhook EFI:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
