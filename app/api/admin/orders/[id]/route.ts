import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, tracking_code } = body;
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID missing" }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (tracking_code !== undefined) updates.tracking_code = tracking_code;

    const { error } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
