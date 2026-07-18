import { NextResponse } from "next/server";
import { syncAllConnections } from "@/lib/sync";

// POST /api/ml/sync/manual — disparado pelo botão "Sincronizar agora" do dashboard.
// Sem CRON_SECRET porque quem chama é você, autenticado na sessão do dashboard.
// Se o dashboard ficar público antes de ter login, proteja essa rota também
// (ex: Vercel Deployment Protection) — ver nota no README.
export async function POST() {
  try {
    await syncAllConnections();
    return NextResponse.redirect(new URL("/dashboard", process.env.APP_URL));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
