"use client";

import { useState } from "react";
import { Truck, CheckCircle2, Clock, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

export default function OrdersAdminClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Metrics calculation
  const totalFaturamento = orders.filter(o => o.status === "pago" || o.status === "enviado").reduce((acc, curr) => acc + curr.amount, 0);
  const totalPedidos = orders.length;
  const pedidosAguardando = orders.filter(o => o.status === "aguardando_pagamento").length;

  const handleUpdateStatus = async (orderId: string, newStatus: string, trackingCode?: string) => {
    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, tracking_code: trackingCode })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, tracking_code: trackingCode || o.tracking_code } : o));
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Erro ao atualizar pedido");
    } finally {
      setLoadingId(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case 'aguardando_pagamento': return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> Aguardando</span>;
      case 'pago': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Pago</span>;
      case 'enviado': return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck className="w-3 h-3"/> Enviado</span>;
      case 'recusado': return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3"/> Cancelado</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold w-fit">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-sm font-semibold text-slate-500">Faturamento (Pagos)</p>
          <p className="text-2xl font-black text-slate-900">R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-sm font-semibold text-slate-500">Total de Pedidos</p>
          <p className="text-2xl font-black text-slate-900">{totalPedidos}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-sm font-semibold text-slate-500">Aguardando Pgto</p>
          <p className="text-2xl font-black text-amber-600">{pedidosAguardando}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID / Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status / Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-slate-900 text-[10px]">#{order.id.split('-')[0]}</p>
                    <p className="text-xs">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{order.payment_method}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{order.customers?.name}</p>
                    <p className="text-xs text-slate-500">{order.customers?.cpf}</p>
                    <p className="text-xs text-slate-500">{order.customers?.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-semibold line-clamp-2 max-w-[200px]">{order.product_title}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900">
                    R$ {order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 space-y-2">
                    <StatusBadge status={order.status} />
                    
                    {/* Actions based on status */}
                    <div className="flex flex-col gap-2 pt-2">
                      {order.status === 'aguardando_pagamento' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateStatus(order.id, 'pago')} disabled={loadingId === order.id} className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded hover:bg-emerald-200 transition-colors">Marcar Pago</button>
                          <button onClick={() => handleUpdateStatus(order.id, 'recusado')} disabled={loadingId === order.id} className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded hover:bg-red-200 transition-colors">Cancelar</button>
                        </div>
                      )}
                      
                      {(order.status === 'pago' || order.status === 'enviado') && (
                        <div className="space-y-1">
                          <input 
                            type="text" 
                            placeholder="Código Rastreio" 
                            defaultValue={order.tracking_code || ''}
                            onBlur={(e) => {
                              if (e.target.value !== order.tracking_code) {
                                handleUpdateStatus(order.id, 'enviado', e.target.value);
                              }
                            }}
                            className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
