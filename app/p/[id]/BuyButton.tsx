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
      <p className="text-center text-xs text-gray-400">
        Redirecionando em {timeLeft}s...
      </p>
    </div>
  );
}

