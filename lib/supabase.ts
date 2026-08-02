import { createClient } from "@supabase/supabase-js";

// Service role — só usar server-side (API routes), NUNCA expor no client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://rxuyrizpbxnawataukil.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { persistSession: false } }
);

export type MlConnection = {
  id: string;
  user_id: string | null;
  ml_user_id: number;
  ml_nickname: string | null;
  client_id: string;
  client_secret: string;
  refresh_token: string;
  access_token: string | null;
  token_expires_at: string | null;
  feed_url: string | null;
};
