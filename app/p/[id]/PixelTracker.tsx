"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function PixelTracker({ 
  pixelId,
  contentId,
  value,
  searchParams
}: { 
  pixelId: string;
  contentId?: string;
  value?: number;
  searchParams?: any;
}) {
  useEffect(() => {
    // Internal Tracking (Fire and forget)
    if (contentId) {
      fetch(`/api/pixel/track?type=view&id=${contentId}`).catch(() => {});
    }

    const eventId = "view_" + Math.random().toString(36).substring(2, 9);
    const eventTime = Math.floor(Date.now() / 1000);

    // CAPI Tracking
    fetch(`/api/pixel/capi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "ViewContent",
        eventId: eventId,
        sourceUrl: window.location.href,
        userAgent: navigator.userAgent,
        clientIp: "0.0.0.0", // Hard to get on client side, omit or pass generic
        fbc: document.cookie.split("; ").find(row => row.startsWith("_fbc="))?.split("=")[1],
        fbp: document.cookie.split("; ").find(row => row.startsWith("_fbp="))?.split("=")[1],
        contentIds: contentId ? [contentId] : [],
        value: value,
        currency: "BRL",
        customData: {
          utm_source: searchParams?.utm_source,
          utm_campaign: searchParams?.utm_campaign,
          utm_medium: searchParams?.utm_medium,
          utm_content: searchParams?.utm_content,
        }
      })
    }).catch(() => {});

    // @ts-ignore
    if (typeof window !== "undefined" && window.fbq) {
      if (contentId && value) {
        // @ts-ignore
        window.fbq('track', 'ViewContent', {
          content_ids: [contentId],
          content_type: 'product',
          value: value,
          currency: 'BRL'
        }, { eventID: eventId });
      } else {
        // @ts-ignore
        window.fbq('track', 'ViewContent', {}, { eventID: eventId });
      }
    }

    // Micro-event: 5 Seconds Time on Page
    const timer = setTimeout(() => {
      const timeEventId = "time_" + Math.random().toString(36).substring(2, 9);
      fetch(`/api/pixel/capi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "ViewedContent_5s",
          eventId: timeEventId,
          sourceUrl: window.location.href,
          userAgent: navigator.userAgent,
          clientIp: "0.0.0.0",
          fbc: document.cookie.split("; ").find(row => row.startsWith("_fbc="))?.split("=")[1],
          fbp: document.cookie.split("; ").find(row => row.startsWith("_fbp="))?.split("=")[1],
          contentIds: contentId ? [contentId] : [],
          customData: {
            utm_source: searchParams?.utm_source,
            utm_campaign: searchParams?.utm_campaign,
          }
        })
      }).catch(() => {});

      // @ts-ignore
      if (typeof window !== "undefined" && window.fbq) {
        // @ts-ignore
        window.fbq('trackCustom', 'ViewedContent_5s', { content_ids: contentId ? [contentId] : [] }, { eventID: timeEventId });
      }
    }, 5000);

    // Micro-event: Scroll 50%
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50) {
        window.removeEventListener('scroll', handleScroll);
        const scrollEventId = "scroll_" + Math.random().toString(36).substring(2, 9);
        
        fetch(`/api/pixel/capi`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "ScrolledPage_50",
            eventId: scrollEventId,
            sourceUrl: window.location.href,
            userAgent: navigator.userAgent,
            clientIp: "0.0.0.0",
            fbc: document.cookie.split("; ").find(row => row.startsWith("_fbc="))?.split("=")[1],
            fbp: document.cookie.split("; ").find(row => row.startsWith("_fbp="))?.split("=")[1],
            contentIds: contentId ? [contentId] : [],
            customData: {
              utm_source: searchParams?.utm_source,
              utm_campaign: searchParams?.utm_campaign,
            }
          })
        }).catch(() => {});

        // @ts-ignore
        if (typeof window !== "undefined" && window.fbq) {
          // @ts-ignore
          window.fbq('trackCustom', 'ScrolledPage_50', { content_ids: contentId ? [contentId] : [] }, { eventID: scrollEventId });
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pixelId, contentId, value, searchParams]);

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
