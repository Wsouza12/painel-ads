"use client";

import { useEffect, useState } from "react";

export default function BuyButton({ permalink }: { permalink: string }) {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Fire pixel
      // @ts-ignore
      if (typeof window !== "undefined" && window.fbq) {
        // @ts-ignore
        window.fbq('track', 'InitiateCheckout');
      }
      // Redirect automatically
      window.location.href = permalink;
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, permalink]);

  return (
    <div className="space-y-2">
      <a 
        href={permalink}
        onClick={() => {
          // @ts-ignore
          if (typeof window !== "undefined" && window.fbq) {
            // @ts-ignore
            window.fbq('track', 'InitiateCheckout');
          }
        }}
        className="w-full bg-[#3483FA] hover:bg-[#2968c8] text-white font-semibold py-3.5 rounded-md flex items-center justify-center transition-colors text-base"
      >
        Comprar agora
      </a>
      
      {/* ML Native Style Redirect Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-[320px] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z" fill="#3483FA"/>
                <path d="M12 11V8L8 12L12 16V13H16V11H12Z" fill="#3483FA"/>
              </svg>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                Ambiente Seguro
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Você está sendo redirecionado para o app oficial do Mercado Livre.
              </p>
            </div>

            <div className="flex justify-center items-center gap-2 text-sm font-medium text-[#3483FA]">
              <div className="w-4 h-4 rounded-full border-2 border-[#3483FA] border-t-transparent animate-spin"></div>
              Aguarde {timeLeft}s...
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <a 
              href={permalink}
              onClick={() => {
                // @ts-ignore
                if (typeof window !== "undefined" && window.fbq) {
                  // @ts-ignore
                  window.fbq('track', 'InitiateCheckout');
                }
              }}
              className="w-full bg-[#3483FA] text-white font-semibold py-2.5 rounded-md flex items-center justify-center text-sm"
            >
              Ir para o App Agora
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

