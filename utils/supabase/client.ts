import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://rxuyrizpbxnawataukil.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dXlyaXpwYnhuYXdhdGF1a2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODQ3NDUsImV4cCI6MjA5NzU2MDc0NX0.YkEOsIXuCipRTwCpDNOhFOFiXeacC2Cbb7awes-gDMo"
  );
}
