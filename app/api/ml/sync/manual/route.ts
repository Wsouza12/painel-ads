import { NextResponse } from "next/server";
import { syncAllConnections } from "@/lib/sync";

export async function POST(request: Request) {
  try {
    await syncAllConnections();
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/dashboard`, { status: 303 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
