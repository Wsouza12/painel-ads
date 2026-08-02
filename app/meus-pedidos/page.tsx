import { ShieldCheck, Truck, Package, Clock, CheckCircle2 } from "lucide-react";
import ClientPortal from "./ClientPortal";

export default function MeusPedidosPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-center sticky top-0 z-30 shadow-sm">
        <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          Acompanhar Meus Pedidos
        </h1>
      </header>
      
      <main className="max-w-xl mx-auto p-4 py-8">
        <ClientPortal />
      </main>
    </div>
  );
}
