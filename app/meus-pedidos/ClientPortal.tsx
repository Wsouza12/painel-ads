"use client";

import { useState } from "react";
import { ArrowRight, Search, Truck, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ClientPortal() {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf) return;
    
    setLoading(true);
    setError("");
    setOrders(null);
    
    try {
      const res = await fetch(`/api/customer/orders?cpf=${cpf.replace(/\D/g, '')}`);
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.orders);
        if (data.orders.length === 0) {
          setError("Nenhum pedido encontrado para este CPF.");
        }
      } else {
        setError(data.message || "Erro ao buscar pedidos");
      }
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'aguardando_pagamento': return { label: 'Aguardando Pagamento', color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock };
      case 'pago': return { label: 'Pagamento Aprovado', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 };
      case 'enviado': return { label: 'Enviado', color: 'text-blue-600', bg: 'bg-blue-100', icon: Truck };
      case 'recusado': return { label: 'Cancelado/Recusado', color: 'text-red-600', bg: 'bg-red-100', icon: ShieldAlert };
      default: return { label: status, color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock };
    }
  };

  return (
    <div className="space-y-6">
      {!orders ? (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-xl font-black text-slate-800">Acompanhe sua Compra</h2>
            <p className="text-sm text-slate-500">Digite seu CPF abaixo para acessar o histórico e os códigos de rastreio dos seus pedidos.</p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CPF do Comprador</label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center tracking-widest text-lg font-mono"
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-xs font-semibold text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar Pedidos
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800">Seus Pedidos</h2>
            <button onClick={() => setOrders(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Sair</button>
          </div>
          
          <div className="space-y-4">
            {orders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status);
              const StatusIcon = statusDisplay.icon;
              
              return (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Pedido #{order.id.split('-')[0]}
                      </p>
                      <h3 className="font-bold text-slate-800 leading-tight">{order.product_title}</h3>
                      <p className="text-xs text-slate-500 mt-1">Feito em {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600">R$ {order.amount.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{order.payment_method}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${statusDisplay.bg} ${statusDisplay.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusDisplay.label}
                    </div>
                    
                    {order.tracking_code && (
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Código de Rastreio</p>
                        <p className="text-sm font-mono font-bold text-slate-900 select-all">{order.tracking_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
