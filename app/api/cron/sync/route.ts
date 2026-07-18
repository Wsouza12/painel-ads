import { NextResponse } from "next/server";
import { syncAllConnections } from "@/lib/sync";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max timeout for the function

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    // Proteção básica para garantir que apenas o serviço de Cron possa chamar esta rota
    if (
      process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("[CRON] Iniciando sincronização automática em loop...");
    await syncAllConnections();
    
    const { rotateABTests } = await import("@/lib/ab-test-cron");
    await rotateABTests();

    console.log("[CRON] Sincronização concluída com sucesso!");

    return NextResponse.json({ success: true, message: "Sync complete" });
  } catch (error: any) {
    console.error("[CRON] Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
