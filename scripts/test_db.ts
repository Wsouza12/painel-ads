import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function check() {
  const { data: connections } = await supabase.from("ml_connections").select("id, ml_nickname, ml_user_id");
  console.log("--- CONEXOES ---", connections);

  const { data: products } = await supabase.from("ml_products").select("id, connection_id, original_title, custom_title").limit(10);
  console.log("--- PRODUTOS (amostra de 10) ---", products);

  const { count } = await supabase.from("ml_products").select("*", { count: 'exact', head: true });
  console.log("TOTAL PRODUTOS NO BANCO:", count);
}

check();
