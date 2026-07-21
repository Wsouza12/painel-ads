"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function PixelTracker({ 
  pixelId,
  contentId,
  value
}: { 
  pixelId: string;
  contentId?: string;
  value?: number;
}) {
  useEffect(() => {
    // Internal Tracking (Fire and forget)
    if (contentId) {
      fetch(`/api/pixel/track?type=view&id=${contentId}`).catch(() => {});
    }

    // @ts-ignore
    if (typeof window !== "undefined" && window.fbq) {
      if (contentId && value) {
        // @ts-ignore
        window.fbq('track', 'ViewContent', {
          content_ids: [contentId],
          content_type: 'product',
          value: value,
          currency: 'BRL'
        });
      } else {
        // @ts-ignore
        window.fbq('track', 'ViewContent');
      }
    }
  }, [pixelId, contentId, value]);

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
}
