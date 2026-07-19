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
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-[340px] overflow-hidden animate-in zoom-in-95 duration-200 p-8 flex flex-col items-center text-center">
          
          <img src="/ml-logo.png" alt="Mercado Livre" className="w-20 h-auto mb-6" />
          
          <h3 className="text-[19px] font-semibold text-black mb-3">
            Indo para o Mercado Livre
          </h3>
          
          <p className="text-[15px] text-[#666666] mb-8 leading-relaxed">
            Você está sendo redirecionado para o ambiente seguro do aplicativo oficial.
          </p>

          <div className="flex items-center justify-center gap-3 text-[15px] font-medium text-[#3483FA] mb-8">
            <div className="w-5 h-5 rounded-full border-2 border-[#3483FA] border-t-transparent animate-spin"></div>
            Aguarde {timeLeft}s...
          </div>
          
          <a 
            href={permalink}
            onClick={() => {
              // @ts-ignore
              if (typeof window !== "undefined" && window.fbq) {
                // @ts-ignore
                window.fbq('track', 'InitiateCheckout');
              }
            }}
            className="w-full bg-[#3483FA] hover:bg-[#2968c8] text-white font-semibold py-3.5 rounded-md flex items-center justify-center transition-colors text-[15px]"
          >
            Ir para o App Agora
          </a>
        </div>
      </div>
    </div>
  );
}

