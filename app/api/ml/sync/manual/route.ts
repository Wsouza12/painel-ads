import { NextResponse } from "next/server";
import { syncAllConnections } from "@/lib/sync";

export async function POST(request: Request) {
  try {
    await syncAllConnections();
    let appUrl = process.env.APP_URL || "https://mercadoshops.up.railway.app";
    if (appUrl.includes("localhost") && process.env.NODE_ENV === "production") {
      appUrl = "https://mercadoshops.up.railway.app";
    }
    return NextResponse.redirect(`${appUrl}/dashboard`, { status: 303 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
