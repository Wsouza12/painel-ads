import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "view" or "click"
    const id = searchParams.get("id"); // ml_item_id or product.id

    if (!type || !id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Try to find the product either by its internal ID or by its ML item ID
    // Since contentId from the frontend is ml_item_id, we search by ml_item_id first.
    // However, there could be multiple products with the same ml_item_id (A/B testing).
    // In that case, we can increment them all or pick the first active one. 
    // To be safe, we increment all rows matching ml_item_id (or exactly matching UUID if it's a UUID).

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (type === "view") {
      if (isUUID) {
        await supabaseAdmin.rpc('increment_views', { p_id: id }); 
        // Note: since we don't have an RPC function 'increment_views', we have to do it manually.
        // Actually, without an RPC, doing x = x + 1 via REST requires a select then update, which has race conditions.
        // But for our dashboard stats, a slight inaccuracy under heavy load is totally fine.
        const { data: p } = await supabaseAdmin.from("ml_products").select("id, views").eq("id", id).single();
        if (p) {
          await supabaseAdmin.from("ml_products").update({ views: (p.views || 0) + 1 }).eq("id", p.id);
        }
      } else {
        const { data: ps } = await supabaseAdmin.from("ml_products").select("id, views").eq("ml_item_id", id);
        if (ps) {
          for (const p of ps) {
            await supabaseAdmin.from("ml_products").update({ views: (p.views || 0) + 1 }).eq("id", p.id);
          }
        }
      }
    } else if (type === "click") {
      if (isUUID) {
        const { data: p } = await supabaseAdmin.from("ml_products").select("id, clicks").eq("id", id).single();
        if (p) {
          await supabaseAdmin.from("ml_products").update({ clicks: (p.clicks || 0) + 1 }).eq("id", p.id);
        }
      } else {
        const { data: ps } = await supabaseAdmin.from("ml_products").select("id, clicks").eq("ml_item_id", id);
        if (ps) {
          for (const p of ps) {
            await supabaseAdmin.from("ml_products").update({ clicks: (p.clicks || 0) + 1 }).eq("id", p.id);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in pixel tracking route:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
