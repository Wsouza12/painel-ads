import { supabaseAdmin } from "../lib/supabase";

async function check() {
  const { data, error } = await supabaseAdmin
    .from("pixel_events_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("--- ULTIMOS 10 EVENTOS EM TEMPO REAL ---");
  data?.forEach(e => {
    console.log(`[${e.created_at}] Evento: ${e.event_name} | UTM_Source: ${e.utm_source || "direto"} | UTM_Campaign: ${e.utm_campaign || "n/a"}`);
  });
}

check();
