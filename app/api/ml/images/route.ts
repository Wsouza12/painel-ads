import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";
import { refreshAccessToken, getItemsDetails } from "@/lib/ml";

export async function GET(request: Request) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }

    // Busca conexão do usuário
    const { data: connection } = await supabaseAdmin
      .from("ml_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: "No connection found" }, { status: 404 });
    }

    const { accessToken } = await refreshAccessToken(connection);
    const items = await getItemsDetails([id], accessToken);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Item not found in ML" }, { status: 404 });
    }

    const images = items[0].pictures?.map((p: any) => p.secure_url) || [];

    return NextResponse.json({ images });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
