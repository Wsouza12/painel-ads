import { NextRequest, NextResponse } from "next/server";
import { syncAllConnections } from "@/lib/sync";

// GET /api/ml/sync — rota do CRON, protegida por CRON_SECRET.
// O Vercel Cron manda o header Authorization automaticamente
// se você configurar em vercel.json.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const results = await syncAllConnections();
    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
