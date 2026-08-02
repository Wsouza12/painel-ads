"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Copy, CreditCard, QrCode, ShieldCheck, Truck, User, FileText, Lock, Loader2, Barcode } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    $gn: any;
  }
}

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

  // Card Data
  const [cardData, setCardData] = useState({
    number: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  });

  // Máscara CPF
  const maskCpf = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 3) return n;
    if (n.length <= 6) return n.slice(0,3) + "." + n.slice(3);
    if (n.length <= 9) return n.slice(0,3) + "." + n.slice(3,6) + "." + n.slice(6);
    return n.slice(0,3) + "." + n.slice(3,6) + "." + n.slice(6,9) + "-" + n.slice(9);
  };

  // Máscara Telefone
  const maskPhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 2) return "(" + n;
    if (n.length <= 7) return "(" + n.slice(0,2) + ") " + n.slice(2);
    return "(" + n.slice(0,2) + ") " + n.slice(2,7) + "-" + n.slice(7);
  };

  // Máscara CEP
  const maskCep = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 8);
    if (n.length <= 5) return n;
    return n.slice(0,5) + "-" + n.slice(5);
  };

  // Máscara Cartão
  const maskCard = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 16);
    return n.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleProcessCheckout = async () => {
    setLoading(true);
    setError("");
    
    try {
      const payload: any = {
        product,
        customer,
        paymentMethod,
        storeSlug
      };

      // Se cartão, gerar token via EFI
      if (paymentMethod === "credit_card") {
        if (!cardData.number || !cardData.holderName || !cardData.expMonth || !cardData.expYear || !cardData.cvv) {
          setError("Preencha todos os dados do cartão.");
          setLoading(false);
          return;
        }

        const cardNumberClean = cardData.number.replace(/\s/g, "");
        const getBrand = (number: string) => {
          if (number.startsWith("4")) return "visa";
          if (/^5[1-5]/.test(number)) return "mastercard";
          if (/^3[47]/.test(number)) return "amex";
          if (/^3(?:0[0-5]|[68][0-9])[0-9]{11}/.test(number)) return "diners";
          if (/^6(?:011|5[0-9]{2})[0-9]{12}/.test(number)) return "discover";
          if (/^(5067|4576|4011|5090|5099|4312|4389|4514)/.test(number)) return "elo";
          if (/^(3841|60)/.test(number)) return "hipercard";
          return "visa"; // fallback
        };

        const brand = getBrand(cardNumberClean);

        // Promise para obter o token da EFI
        const paymentToken = await new Promise((resolve, reject) => {
          if (!window.$gn) {
            reject("Script de pagamento seguro (EFI) não carregou. Recarregue a página.");
            return;
          }

          window.$gn.ready((checkout: any) => {
            checkout.getPaymentToken({
              brand: brand,
              number: cardNumberClean,
              cvv: cardData.cvv,
              expiration_month: cardData.expMonth,
              expiration_year: cardData.expYear
            }, (err: any, res: any) => {
              if (err) {
                reject("Erro ao verificar cartão: " + (err.error_description || "Dados inválidos"));
              } else {
                resolve(res.data.payment_token);
              }
            });
          });
        });

        payload.cardData = {
          paymentToken: paymentToken
        };
      }

      const res = await fetch("/api/checkout/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success) {
        setCheckoutResult(data);

        // Fire Purchase event
        try {
          fetch("/api/pixel/capi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventName: "Purchase",
              eventId: "pur_" + Math.random().toString(36).substring(2, 9),
              sourceUrl: window.location.href,
              contentIds: [product.ml_item_id],
              value: product.price,
              currency: "BRL",
            })
          }).catch(() => {});
        } catch {}
      } else {
        setError(data.message || "Erro ao processar pagamento.");
      }
    } catch (err) {
      setError("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // ========== TELA DE RESULTADO ==========
  if (checkoutResult) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6 max-w-lg mx-auto">
        <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Pedido Gerado!</h2>
        <p className="text-slate-600">Seu pedido <strong className="text-slate-900">#{checkoutResult.orderId?.substring(0,8)}</strong> foi registrado.</p>

        {/* ===== RESULTADO PIX ===== */}
        {checkoutResult.paymentMethod === "pix" && (
          <div className="space-y-4">
            {checkoutResult.qrCodeBase64 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <img 
                  src={`data:image/png;base64,${checkoutResult.qrCodeBase64}`} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
            )}
            {checkoutResult.pixCopyPaste && (
              <>
                <p className="text-sm text-slate-500">Copie o código PIX abaixo:</p>
                <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-2 overflow-hidden relative group">
                  <span className="text-xs text-slate-500 truncate select-all flex-1">{checkoutResult.pixCopyPaste}</span>
                  <button 
                    onClick={() => copyText(checkoutResult.pixCopyPaste)}
                    className="shrink-0 bg-white p-1.5 rounded-md shadow-sm border border-slate-200 hover:bg-emerald-50 text-emerald-600 transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
            <div className="flex items-center justify-center gap-2 text-emerald-600 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-semibold">Aguardando pagamento...</span>
            </div>
          </div>
        )}

        {/* ===== RESULTADO BOLETO ===== */}
        {checkoutResult.paymentMethod === "boleto" && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <Barcode className="w-12 h-12 mx-auto text-amber-600 mb-2" />
              <p className="text-sm font-semibold text-amber-800">Boleto Bancário Gerado</p>
              <p className="text-xs text-amber-600 mt-1">Vencimento em 3 dias úteis</p>
            </div>
            {checkoutResult.linhaDigitavel && (
              <>
                <p className="text-sm text-slate-500">Linha Digitável:</p>
                <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-2 overflow-hidden relative">
                  <span className="text-xs text-slate-600 truncate select-all flex-1 font-mono">{checkoutResult.linhaDigitavel}</span>
                  <button 
                    onClick={() => copyText(checkoutResult.linhaDigitavel)}
                    className="shrink-0 bg-white p-1.5 rounded-md shadow-sm border border-slate-200 hover:bg-emerald-50 text-emerald-600 transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
            {checkoutResult.boletoUrl && (
              <a 
                href={checkoutResult.boletoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-amber-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Abrir Boleto
              </a>
            )}
            <div className="flex items-center justify-center gap-2 text-amber-600 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-semibold">Aguardando pagamento do boleto...</span>
            </div>
          </div>
        )}

        {/* ===== RESULTADO CARTÃO ===== */}
        {checkoutResult.paymentMethod === "credit_card" && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${checkoutResult.cardStatus === "approved" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}>
              <CreditCard className={`w-12 h-12 mx-auto mb-2 ${checkoutResult.cardStatus === "approved" ? "text-emerald-600" : "text-blue-600"}`} />
              <p className={`text-sm font-semibold ${checkoutResult.cardStatus === "approved" ? "text-emerald-800" : "text-blue-800"}`}>
                {checkoutResult.cardStatus === "approved" ? "Pagamento Aprovado!" : "Pagamento em Processamento"}
              </p>
              <p className={`text-xs mt-1 ${checkoutResult.cardStatus === "approved" ? "text-emerald-600" : "text-blue-600"}`}>
                {checkoutResult.cardStatus === "approved" 
                  ? "Seu pedido será enviado em breve!" 
                  : "Estamos processando seu pagamento. Você receberá a confirmação em instantes."}
              </p>
            </div>
            {checkoutResult.cardStatus !== "approved" && (
              <div className="flex items-center justify-center gap-2 text-blue-600 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-semibold">Processando pagamento...</span>
              </div>
            )}
          </div>
        )}

        {/* Link para acompanhar */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-3">Acompanhe seu pedido:</p>
          <button 
            onClick={() => router.push("/meus-pedidos")}
            className="bg-slate-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-900 transition-colors"
          >
            Meus Pedidos
          </button>
        </div>
      </div>
    );
  }

  // ========== FORMULÁRIO DE CHECKOUT ==========
  return (
    <>
      <Script 
        src={`https://api.efipay.com.br/v1/cdn/Oecf209bd5aa4c1c9a65249124dcefcd/${Math.floor(Math.random() * 1000000)}`} 
        strategy="lazyOnload" 
      />
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.num ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
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
            {/* ===== STEP 1: IDENTIFICAÇÃO ===== */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">Seus Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nome Completo</label>
                    <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" placeholder="João da Silva" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">CPF</label>
                    <input required type="text" value={customer.cpf} onChange={e => setCustomer({...customer, cpf: maskCpf(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Telefone / WhatsApp</label>
                    <input required type="text" value={customer.phone} onChange={e => setCustomer({...customer, phone: maskPhone(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">E-mail</label>
                    <input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" placeholder="joao@email.com" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors active:scale-[0.98]">
                  Continuar para Entrega →
                </button>
              </div>
            )}

            {/* ===== STEP 2: ENTREGA ===== */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                  <button type="button" onClick={() => setStep(1)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-4 h-4 text-slate-600" /></button>
                  <h3 className="font-bold text-lg text-slate-800">Endereço de Entrega</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-600">CEP</label>
                    <input required type="text" value={customer.zipCode} onChange={e => setCustomer({...customer, zipCode: maskCep(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" placeholder="00000-000" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">Endereço Completo</label>
                    <input required type="text" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" placeholder="Rua Exemplo, Bairro" />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-600">Número</label>
                    <input required type="text" value={customer.number} onChange={e => setCustomer({...customer, number: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" placeholder="123" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors active:scale-[0.98]">
                  Ir para Pagamento →
                </button>
              </div>
            )}

            {/* ===== STEP 3: PAGAMENTO ===== */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                  <button type="button" onClick={() => setStep(2)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-4 h-4 text-slate-600" /></button>
                  <h3 className="font-bold text-lg text-slate-800">Forma de Pagamento</h3>
                </div>
                
                {/* Tabs de pagamento */}
                <div className="grid grid-cols-3 gap-3">
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100' : 'border-slate-200 hover:border-emerald-300 text-slate-600'}`}>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                    <QrCode className="w-6 h-6" />
                    <span className="font-bold text-sm">PIX</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">-5% OFF</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'credit_card' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100' : 'border-slate-200 hover:border-emerald-300 text-slate-600'}`}>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} />
                    <CreditCard className="w-6 h-6" />
                    <span className="font-bold text-sm">Cartão</span>
                    <span className="text-[10px] text-slate-400 font-medium">Até 12x</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'boleto' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100' : 'border-slate-200 hover:border-emerald-300 text-slate-600'}`}>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'boleto'} onChange={() => setPaymentMethod('boleto')} />
                    <Barcode className="w-6 h-6" />
                    <span className="font-bold text-sm">Boleto</span>
                    <span className="text-[10px] text-slate-400 font-medium">À vista</span>
                  </label>
                </div>

                {/* ===== Formulário de Cartão (aparece quando selecionado) ===== */}
                {paymentMethod === "credit_card" && (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Dados do Cartão
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Número do Cartão</label>
                        <input 
                          type="text" 
                          value={cardData.number} 
                          onChange={e => setCardData({...cardData, number: maskCard(e.target.value)})} 
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-shadow" 
                          placeholder="0000 0000 0000 0000" 
                          maxLength={19}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Nome no Cartão</label>
                        <input 
                          type="text" 
                          value={cardData.holderName} 
                          onChange={e => setCardData({...cardData, holderName: e.target.value.toUpperCase()})} 
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase transition-shadow" 
                          placeholder="JOÃO DA SILVA" 
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Mês</label>
                          <select 
                            value={cardData.expMonth} 
                            onChange={e => setCardData({...cardData, expMonth: e.target.value})} 
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                          >
                            <option value="">Mês</option>
                            {Array.from({length:12}, (_,i) => String(i+1).padStart(2,'0')).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Ano</label>
                          <select 
                            value={cardData.expYear} 
                            onChange={e => setCardData({...cardData, expYear: e.target.value})} 
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                          >
                            <option value="">Ano</option>
                            {Array.from({length:10}, (_,i) => String(new Date().getFullYear() + i)).map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">CVV</label>
                          <input 
                            type="text" 
                            value={cardData.cvv} 
                            onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0,4)})} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-shadow" 
                            placeholder="000" 
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Lock className="w-3 h-3" />
                      Seus dados são criptografados e protegidos
                    </div>
                  </div>
                )}

                {/* Info Boleto */}
                {paymentMethod === "boleto" && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-amber-800 font-medium">📄 O boleto será gerado após confirmar a compra. Vencimento em 3 dias úteis.</p>
                  </div>
                )}

                {/* Info PIX */}
                {paymentMethod === "pix" && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-emerald-800 font-medium">⚡ Pagamento instantâneo via PIX com <strong>5% de desconto</strong>! O QR Code será gerado após confirmar.</p>
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={handleProcessCheckout}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-emerald-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
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
            {paymentMethod === "pix" && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto PIX (-5%)</span>
                <span>-R$ {(product.price * 0.05).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-emerald-600">
              <span>Frete Grátis</span>
              <span>R$ 0,00</span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <span className="font-semibold text-slate-800">Total</span>
            <span className="text-2xl font-black text-slate-900">
              R$ {paymentMethod === "pix" ? (product.price * 0.95).toFixed(2) : product.price.toFixed(2)}
            </span>
          </div>
          {paymentMethod === "credit_card" && (
            <p className="text-[10px] text-slate-400 mt-1 text-right">ou até 12x de R$ {(product.price / 12).toFixed(2)}</p>
          )}

          <div className="mt-6 bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <Lock className="w-4 h-4 text-emerald-600" />
            Pagamento 100% Seguro
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
