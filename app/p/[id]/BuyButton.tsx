"use client";

import { useEffect, useState } from "react";

export default function BuyButton({ 
  permalink,
  contentId,
  value
}: { 
  permalink: string;
  contentId?: string;
  value?: number;
}) {
  const [timeLeft, setTimeLeft] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    if (timeLeft <= 0) {
      window.location.href = permalink;
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isModalOpen, permalink]);

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Internal Tracking
    if (contentId) {
      fetch(`/api/pixel/track?type=click&id=${contentId}`).catch(() => {});
    }

    // Fire pixel
    // @ts-ignore
    if (typeof window !== "undefined" && window.fbq) {
      if (contentId && value) {
        // @ts-ignore
        window.fbq('track', 'InitiateCheckout', {
          content_ids: [contentId],
          content_type: 'product',
          value: value,
          currency: 'BRL'
        });
      } else {
        // @ts-ignore
        window.fbq('track', 'InitiateCheckout');
      }
    }

    setIsModalOpen(true);
    setTimeLeft(3); // Reset to 3 seconds
  };

  return (
    <div className="space-y-2">
      <button 
        onClick={handleBuyClick}
        className="w-full bg-[#3483FA] hover:bg-[#2968c8] text-white font-semibold py-3.5 rounded-md flex items-center justify-center transition-colors text-base"
      >
        Comprar agora
      </button>
      
      {/* ML Integration Style Redirect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-in zoom-in-95 duration-200 p-6 flex flex-col">
            
            <div className="text-left mb-4">
              <h3 className="text-[#2D3277] text-lg font-bold">
                Mercado Livre
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                Redirecionando PARA ambiente 100% seguro
              </p>
            </div>
            
            <div className="border-t border-gray-100 my-2"></div>

            <div className="flex flex-row items-center gap-4 py-4">
              {/* Ícone amarelo */}
              <div className="flex-shrink-0 w-20 h-20 bg-[#FFE600] rounded-2xl flex items-center justify-center shadow-sm border border-yellow-300/50 overflow-hidden">
                <img src="/ml-logo.png" alt="Mercado Livre" className="w-16 h-auto" />
              </div>

              {/* Checkmarks */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#3483FA] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[11px] leading-tight text-gray-600 font-medium">Sua compra é processada em um ambiente 100% seguro.</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#3483FA] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[11px] leading-tight text-gray-600 font-medium">O seu pagamento só é liberado para nós quando você receber o produto.</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#3483FA] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[11px] leading-tight text-gray-600 font-medium">Reembolso e devolução 100% garantidos.</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-2"></div>
            
            <div className="flex flex-col items-center mt-3">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[15px] font-bold text-gray-600">Redirecionando para o App...</span>
                <svg className="w-5 h-5 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-[15px] font-bold text-gray-600">({timeLeft}s)</span>
              </div>

              <a 
                href={permalink}
                className="w-full bg-[#3483FA] hover:bg-[#2968c8] text-white font-semibold py-3.5 rounded-md flex items-center justify-center transition-colors text-[15px]"
              >
                Ir para o App Agora
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

