import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MetricsGrid from "./MetricsGrid";

export const revalidate = 0; // force dynamic

export default async function AnalyticsPage() {
  const supabaseAuth = createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Calculate Date Boundaries
  const now = new Date();
  
  // Today start
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  // Yesterday start
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  // Yesterday end (same as today start)
  const yesterdayEnd = new Date(todayStart);

  // Fetch events for today and yesterday
  // We use Supabase SDK to fetch them all since volume might be reasonable for a personal dashboard. 
  // For massive scale, this should be an RPC or aggregate query.
  const { data: events } = await supabaseAdmin
    .from("pixel_events_log")
    .select("event_name, created_at, value")
    .gte("created_at", yesterdayStart.toISOString())
    .lte("created_at", now.toISOString());

  const todayEvents = (events || []).filter(e => new Date(e.created_at) >= todayStart);
  const yesterdayEvents = (events || []).filter(e => new Date(e.created_at) >= yesterdayStart && new Date(e.created_at) < yesterdayEnd);

  // Helper to count events
  const getStats = (eventList: any[]) => {
    return {
      views: eventList.filter(e => e.event_name === "ViewContent").length,
      engagements: eventList.filter(e => e.event_name === "ViewedContent_5s").length,
      checkouts: eventList.filter(e => e.event_name === "InitiateCheckout").length,
      purchases: eventList.filter(e => e.event_name === "Purchase").length,
      revenue: eventList.filter(e => e.event_name === "Purchase").reduce((acc, e) => acc + (Number(e.value) || 0), 0)
    };
  };

  const todayStats = getStats(todayEvents);
  const yesterdayStats = getStats(yesterdayEvents);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black text-neutral-100 px-6 py-10 selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="text-neutral-400 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </a>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
                Analytics ao Vivo
              </h1>
            </div>
            <p className="text-neutral-400 text-sm mt-2 font-medium ml-9">
              Acompanhamento de funil em tempo real (Hoje vs Ontem)
            </p>
          </div>
        </header>

        <MetricsGrid today={todayStats} yesterday={yesterdayStats} />

      </div>
    </main>
  );
}
