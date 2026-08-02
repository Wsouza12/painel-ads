"use client";

import { useState } from "react";
import { Search, Package, CheckCircle2, Clock, Truck, XCircle, QrCode, CreditCard, FileText, ChevronRight, ShoppingBag } from "lucide-react";

const maskCpf = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return n.slice(0, 3) + "." + n.slice(3);
  if (n.length <= 9) return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6);
  return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6, 9) + "-" + n.slice(9);
};

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  aguardando_pagamento: { label: "Aguardando Pagamento", color: "text-amber-400", icon: Clock, bg: "bg-amber-500/10 border-amber-500/20" },
  pago:               { label: "Pago",                  color: "text-emerald-400", icon: CheckCircle2, bg: "bg-emerald-500/10 border-emerald-500/20" },
  enviado:            { label: "Enviado",               color: "text-blue-400", icon: Truck, bg: "bg-blue-500/10 border-blue-500/20" },
  entregue:           { label: "Entregue",              color: "text-emerald-400", icon: CheckCircle2, bg: "bg-emerald-500/10 border-emerald-500/20" },
  cancelado:          { label: "Cancelado",             color: "text-red-400", icon: XCircle, bg: "bg-red-500/10 border-red-500/20" },
};

const paymentIcon: Record<string, any> = {
  pix: QrCode,
  credit_card: CreditCard,
  boleto: FileText,
};

const paymentLabel: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  boleto: "Boleto",
};

export default function RastreioPage() {
  const [cpf, setCpf] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cpf.replace(/\D/g, "");
    if (clean.length < 11) {
      setError("Digite um CPF válido com 11 dígitos.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const res = await fetch(`/api/customer/orders?cpf=${clean}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Erro ao buscar pedidos.");
        setOrders([]);
      } else {
        setOrders(data.orders ?? []);
        setSearched(true);
      }
    } catch {
      setError("Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Rastreamento de Pedidos</h1>
            <p className="text-xs text-slate-400">Acompanhe o status das suas compras</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Search Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <p className="text-sm text-slate-300 mb-4 font-medium">Digite seu CPF para ver todos os seus pedidos:</p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={cpf}
                onChange={e => setCpf(maskCpf(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono text-base"
                maxLength={14}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </form>
          {error && (
            <div className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {searched && orders.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">Nenhum pedido encontrado</p>
            <p className="text-slate-600 text-sm mt-1">Verifique se o CPF está correto</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 font-medium">{orders.length} pedido{orders.length > 1 ? "s" : ""} encontrado{orders.length > 1 ? "s" : ""}:</p>
            {orders.map((order: any) => {
              const status = statusConfig[order.status] ?? statusConfig["aguardando_pagamento"];
              const StatusIcon = status.icon;
              const PayIcon = paymentIcon[order.payment_method] ?? Package;
              return (
                <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all backdrop-blur-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    {/* Order ID + Date */}
                    <div>
                      <p className="font-mono text-xs text-slate-500 mb-1">Pedido #{order.id?.substring(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-slate-300">
                        {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </div>
                  </div>

                  {/* Product */}
                  {order.product_title && (
                    <div className="flex items-center gap-3 bg-black/20 rounded-xl p-3 mb-4">
                      <Package className="w-5 h-5 text-slate-400 shrink-0" />
                      <p className="text-sm text-slate-200 flex-1 line-clamp-1">{order.product_title}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5">
                    {/* Payment method */}
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <PayIcon className="w-4 h-4" />
                      <span>{paymentLabel[order.payment_method] ?? order.payment_method}</span>
                    </div>
                    {/* Amount */}
                    <div className="text-right">
                      <span className="text-lg font-bold text-white">
                        R$ {Number(order.amount ?? 0).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>

                  {/* Tracking code if exists */}
                  {order.tracking_code && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-slate-400">Código de rastreio:</span>
                      <span className="font-mono text-xs text-blue-300 font-bold">{order.tracking_code}</span>
                      <a
                        href={`https://rastreamento.correios.com.br/app/index.php?numero=${order.tracking_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Rastrear nos Correios <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
