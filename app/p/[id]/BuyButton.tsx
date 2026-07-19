"use client";

export default function BuyButton({ permalink }: { permalink: string }) {
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
      <span className="text-xs font-normal text-blue-100 opacity-90">Você será redirecionado em segurança</span>
    </a>
  );
}
