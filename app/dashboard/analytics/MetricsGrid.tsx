"use client";

import { useEffect, useState } from "react";

type Stats = {
  views: number;
  engagements: number;
  checkouts: number;
  purchases: number;
  revenue: number;
};

export default function MetricsGrid({ today, yesterday }: { today: Stats; yesterday: Stats }) {
  // Simple auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateGrowth = (current: number, past: number) => {
    if (past === 0) return current > 0 ? "+100%" : "0%";
    const diff = current - past;
    const percent = (diff / past) * 100;
    return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
  };

  const isPositive = (current: number, past: number) => current >= past;

  const MetricCard = ({ title, todayVal, yesterdayVal, prefix = "" }: { title: string, todayVal: number, yesterdayVal: number, prefix?: string }) => {
    const growth = calculateGrowth(todayVal, yesterdayVal);
    const positive = isPositive(todayVal, yesterdayVal);

    return (
      <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
        <p className="text-neutral-400 text-sm font-medium mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold text-white">
            {prefix}{todayVal.toLocaleString('pt-BR', { minimumFractionDigits: prefix ? 2 : 0 })}
          </h2>
          <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {positive ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-9-9-9 9"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 9 9 9-9"/></svg>
            )}
            <span>{growth}</span>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Ontem: {prefix}{yesterdayVal.toLocaleString('pt-BR', { minimumFractionDigits: prefix ? 2 : 0 })}
        </p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard title="Visitas (ViewContent)" todayVal={today.views} yesterdayVal={yesterday.views} />
      <MetricCard title="Engajamentos (+5s)" todayVal={today.engagements} yesterdayVal={yesterday.engagements} />
      <MetricCard title="Botão de Comprar (Checkout)" todayVal={today.checkouts} yesterdayVal={yesterday.checkouts} />
      <MetricCard title="Vendas (Purchase)" todayVal={today.purchases} yesterdayVal={yesterday.purchases} />
      <MetricCard title="Receita Aprovada" todayVal={today.revenue} yesterdayVal={yesterday.revenue} prefix="R$ " />
      
      {/* Funnel Conversion Rate */}
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-xl lg:col-span-3">
        <h3 className="text-lg font-bold text-white mb-4">Métricas de Funil (Hoje)</h3>
        <div className="flex flex-col sm:flex-row gap-8 justify-around">
          <div className="text-center">
            <p className="text-purple-300 text-sm mb-1">Visita → Engajamento</p>
            <p className="text-2xl font-bold text-white">
              {today.views > 0 ? ((today.engagements / today.views) * 100).toFixed(1) : "0"}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-purple-300 text-sm mb-1">Engajamento → Clique</p>
            <p className="text-2xl font-bold text-white">
              {today.engagements > 0 ? ((today.checkouts / today.engagements) * 100).toFixed(1) : "0"}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-purple-300 text-sm mb-1">Clique → Venda</p>
            <p className="text-2xl font-bold text-white">
              {today.checkouts > 0 ? ((today.purchases / today.checkouts) * 100).toFixed(1) : "0"}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
