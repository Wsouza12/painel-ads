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
    <a 
      href={permalink}
      onClick={() => {
        // @ts-ignore
        if (typeof window !== "undefined" && window.fbq) {
          // @ts-ignore
          window.fbq('track', 'InitiateCheckout');
        }
      }}
      className="w-full bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold py-4 rounded-md flex flex-col items-center justify-center transition-colors shadow-lg"
    >
      <span className="text-lg">Comprar no Mercado Livre</span>
      <span className="text-xs font-normal text-blue-100 opacity-90 mt-1">
        Redirecionando automaticamente em {timeLeft}s...
      </span>
    </a>
  );
}
