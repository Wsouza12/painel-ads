"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Phone, Search, ShieldCheck, Loader2 } from "lucide-react";

const maskCpf = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return n.slice(0, 3) + "." + n.slice(3);
  if (n.length <= 9) return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6);
  return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6, 9) + "-" + n.slice(9);
};

const maskPhone = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return "(" + n;
  if (n.length <= 7) return "(" + n.slice(0, 2) + ") " + n.slice(2);
  return "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
};

export default function ClienteLoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length < 11) {
      setError("CPF inválido. Digite todos os 11 dígitos.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/customer/orders?cpf=${cleanCpf}`);
      const data = await res.json();

      if (!data.success) {
        setError("Não encontramos uma conta com esses dados.");
        setLoading(false);
        return;
      }

      if (!data.orders || data.orders.length === 0) {
        setError("Nenhum pedido encontrado para esse CPF.");
        setLoading(false);
        return;
      }

      // Verificar telefone contra o customer
      const cleanPhone = phone.replace(/\D/g, "");
      const customerPhone = (data.orders[0]?.customer_phone ?? "").replace(/\D/g, "");
      
      // Se não tem telefone salvo, só verificar CPF
      if (customerPhone && cleanPhone && !customerPhone.endsWith(cleanPhone.slice(-4))) {
        setError("Telefone não confere com o cadastro.");
        setLoading(false);
        return;
      }

      // Redirecionar com CPF na URL (sessão simples via localStorage)
      if (typeof window !== "undefined") {
        localStorage.setItem("cliente_cpf", cleanCpf);
      }
      router.push(`/meus-pedidos?cpf=${cleanCpf}`);
    } catch {
      setError("Falha na comunicação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Glow decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          {/* Logo / Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Minha Conta</h1>
            <p className="text-slate-400 text-sm mt-1">
              Acesse seus pedidos usando CPF e telefone
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CPF */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CPF</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={cpf}
                  onChange={e => setCpf(maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                  maxLength={14}
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(maskPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  maxLength={15}
                />
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Ver Meus Pedidos
                </>
              )}
            </button>
          </form>

          {/* Segurança */}
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Acesso seguro. Seus dados são protegidos.
          </div>
        </div>

        {/* Links extras */}
        <div className="text-center mt-6 space-y-2">
          <a href="/rastreio" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">
            Rastrear pedido sem conta →
          </a>
        </div>
      </div>
    </div>
  );
}
