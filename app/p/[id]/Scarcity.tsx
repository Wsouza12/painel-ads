"use client";

import { useEffect, useState } from "react";

export default function Scarcity({ productId }: { productId: string }) {
  // Generate a consistent "units left" based on the product ID so it doesn't change on refresh
  const getConsistentStock = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Result between 2 and 7
    return Math.abs(hash % 6) + 2;
  };

  const [stock] = useState(getConsistentStock(productId));
  const [viewers, setViewers] = useState(14);

  useEffect(() => {
    // Randomize initial viewers between 12 and 25
    setViewers(Math.floor(Math.random() * 14) + 12);

    // Occasionally change viewers to simulate real-time traffic
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        if (next < 8) return prev + 2;
        if (next > 35) return prev - 2;
        return next;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white px-4 py-3 mb-2 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-[#f55940]">🔥 Alta demanda!</p>
        <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded text-xs text-red-600 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          {viewers} pessoas visualizando
        </div>
      </div>
      
      <p className="text-xs text-gray-700 mb-2 font-medium">
        Restam apenas <span className="text-[#f55940] font-bold">{stock} unidades</span> no estoque
      </p>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[#f55940] h-2 rounded-full transition-all duration-1000"
          style={{ width: `${(stock / 15) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
