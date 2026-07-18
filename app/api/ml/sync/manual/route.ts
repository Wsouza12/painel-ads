import { NextResponse } from "next/server";
import { syncAllConnections } from "@/lib/sync";

export async function POST(request: Request) {
  try {
    await syncAllConnections();
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
