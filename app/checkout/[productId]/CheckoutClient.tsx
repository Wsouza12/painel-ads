"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Copy, CreditCard, QrCode, ShieldCheck, Truck, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutClient({
  product,
  storeSlug,
}: {
  product: { id: string; ml_item_id: string; title: string; price: number; imageUrl: string };
  storeSlug: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Customer Data
  const [customer, setCustomer] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    zipCode: "",
    address: "",
    number: "",
  });

  // Payment Data
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "boleto" | "credit_card">("pix");
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleProcessCheckout = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/checkout/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          customer,
          paymentMethod,
          storeSlug
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setCheckoutResult(data);
      } else {
        setError(data.message || "Erro ao processar pagamento.");
      }
    } catch (err) {
      setError("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    if (checkoutResult?.pixCopyPaste) {
      navigator.clipboard.writeText(checkoutResult.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (checkoutResult) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Pedido Gerado!</h2>
        <p className="text-slate-600">Seu pedido <strong className="text-slate-900">#{checkoutResult.orderId?.substring(0,8)}</strong> foi registrado.</p>

        {paymentMethod === "pix" && checkoutResult.qrCodeBase64 && (
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img 
                src={`data:image/png;base64,${checkoutResult.qrCodeBase64}`} 
                alt="QR Code PIX" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-slate-500">Ou use o código Copia e Cola abaixo:</p>
            <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-2 overflow-hidden relative group">
              <span className="text-xs text-slate-500 truncate select-all">{checkoutResult.pixCopyPaste}</span>
              <button 
                onClick={copyPix}
                className="absolute right-2 bg-white p-1.5 rounded-md shadow-sm border border-slate-200 hover:bg-emerald-50 text-emerald-600 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs font-semibold text-emerald-600 animate-pulse">Aguardando pagamento...</p>
          </div>
        )}

        {/* Simulador de feedback contínuo poderia entrar aqui para aprovação automática */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Coluna Esquerda: Formulário */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between px-2 mb-8">
          {[
            { num: 1, icon: User, label: "Identificação" },
            { num: 2, icon: Truck, label: "Entrega" },
            { num: 3, icon: ShieldCheck, label: "Pagamento" }
          ].map((s) => (
            <div key={s.num} className={`flex flex-col items-center gap-2 ${step >= s.num ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= s.num ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase">{s.label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleNextStep}>
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">Seus Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nome Completo</label>
                    <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="João da Silva" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">CPF</label>
                    <input required type="text" value={customer.cpf} onChange={e => setCustomer({...customer, cpf: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Telefone / WhatsApp</label>
                    <input required type="text" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">E-mail</label>
                    <input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="joao@email.com" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors">
                  Continuar para Entrega
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                  <button type="button" onClick={() => setStep(1)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-4 h-4 text-slate-600" /></button>
                  <h3 className="font-bold text-lg text-slate-800">Endereço de Entrega</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-600">CEP</label>
                    <input required type="text" value={customer.zipCode} onChange={e => setCustomer({...customer, zipCode: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="00000-000" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">Endereço Completo</label>
                    <input required type="text" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Rua Exemplo" />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-600">Número</label>
                    <input required type="text" value={customer.number} onChange={e => setCustomer({...customer, number: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="123" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors">
                  Ir para Pagamento
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                  <button type="button" onClick={() => setStep(2)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-4 h-4 text-slate-600" /></button>
                  <h3 className="font-bold text-lg text-slate-800">Forma de Pagamento</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-300 text-slate-600'}`}>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                    <QrCode className="w-6 h-6" />
                    <span className="font-bold text-sm">PIX</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">-5% OFF</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'credit_card' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-300 text-slate-600'}`}>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} />
                    <CreditCard className="w-6 h-6" />
                    <span className="font-bold text-sm">Cartão</span>
                    <span className="text-[10px] text-slate-400">Até 12x</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'boleto' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-300 text-slate-600'}`}>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'boleto'} onChange={() => setPaymentMethod('boleto')} />
                    <span className="font-bold text-sm">Boleto</span>
                    <span className="text-[10px] text-slate-400">À vista</span>
                  </label>
                </div>

                <button 
                  type="button" 
                  onClick={handleProcessCheckout}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Finalizar Compra Segura
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Coluna Direita: Resumo */}
      <div className="md:col-span-1">
        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 sticky top-4">
          <h3 className="font-bold text-slate-800 mb-4">Resumo do Pedido</h3>
          
          <div className="flex gap-4 mb-6 pb-6 border-b border-slate-200">
            <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 overflow-hidden relative shrink-0">
              {product.imageUrl && <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 line-clamp-2">{product.title}</p>
              <p className="text-emerald-600 font-bold mt-1">R$ {product.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600 mb-6 border-b border-slate-200 pb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>R$ {product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Frete Grátis</span>
              <span>R$ 0,00</span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <span className="font-semibold text-slate-800">Total</span>
            <span className="text-2xl font-black text-slate-900">R$ {product.price.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-right">em até 12x no cartão</p>

          <div className="mt-6 bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <Lock className="w-4 h-4 text-emerald-600" />
            Pagamento 100% Seguro
          </div>
        </div>
      </div>
    </div>
  );
}
