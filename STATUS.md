# Status do Projeto: Painel Ads (Sistema ML -> Meta & Google Ads)
**Última Atualização:** 26 de Julho de 2026

## O que é o projeto?
O **"Painel Ads"** é uma plataforma avançada de arbitragem, dropshipping e tráfego pago integrada ao ecossistema do Mercado Livre. O sistema opera como uma **"Ponte" Inteligente** entre o tráfego de anúncios (Meta Ads, Instagram Reels/Stories e Google Ads) e o Mercado Livre. Elimina o vazamento de tráfego para a concorrência, disponibiliza Páginas Ponte ultra-rápidas com vídeos MP4 em alta conversão e gera Feeds XML (Catálogos Dinâmicos) prontos para escala no Meta Ads e Google Merchant Center.

## Stack e Hospedagem
- **Hospedagem Principal:** Railway (`mercadoshops.up.railway.app`).
- **Repositórios (Git Dual-Push):** `Wsouza12/painel-ads` e `Wsouza12/painel-ads-lomZ` no branch `main`.
- **Frontend:** Next.js (App Router), React, TailwindCSS, Glassmorphism.
- **Backend/Auth:** Next.js Route Handlers + Supabase (`ml_products`, `ml_ab_tests`, `pixel_events_log`).
- **Armazenamento de Vídeo:** Cloudflare R2.

## Principais Realizações e Funcionalidades Ativas

1. **Páginas Ponte de Alta Conversão & Player MP4 Nativo (`app/p/[id]/page.tsx`):**
   - Player HTML5 MP4 nativo no topo do produto (autoPlay, muted, loop, playsInline) para vídeos verticais (9:16) e quadrados (1:1).
   - **Efeito Flash (0.8s):** Redirecionamento otimizado com modal abrindo em 100ms e transição em 800ms, permitindo rastreamento 100% íntegro sem causar abandono pelo cliente.
   - **Deep Linking Nativo no Celular:** Abertura garantida do **aplicativo oficial do Mercado Livre (`com.mercadolibre`)** em Android e iOS. O comprador entra logado em seu app, finalizando compras no Pix/Cartão com 1 clique sem pedido de senha na web.

2. **Google Merchant Center & Google Ads (Verificado e no Ar):**
   - Domínio `mercadoshops.up.railway.app` oficialmente Verificado e Reivindicado no Google Merchant Center (ID `5827915218`, Conta `Zayhon`).
   - Política de Devolução oficial publicada em `/politica-de-devolucao` conforme regras de Compra Garantida de 30 dias.
   - Campanha `Performance Max-1` ativa no Google Ads.

3. **Catálogos Dinâmicos com Vídeo para Meta Ads & Google Ads (`/api/ml/feed/[id]` e `/single/[id]`):**
   - Injeção automática das colunas de vídeo (`video_url`, `video`, `video[0].url`, `video[1].url`) nos feeds XML e CSV globais e individuais.
   - Suporte completo para campanhas de **Advantage+ Catalog no Meta Ads** exibindo vídeos em movimento no Reels e Stories.
   - Rótulos para Testes A/B (`custom_label_0` com `Variante A`, `Variante B` e `Normal`).

4. **Analytics de Atribuição de Origem em Tempo Real (`/dashboard/analytics`):**
   - Rastreamento e agrupamento em tempo real de eventos por canal (`utm_source` e `utm_campaign`), dividindo visualizações, cliques e checkouts entre Meta Ads, Google Ads e Tráfego Direto.
   - Disparo simultâneo de eventos **Meta Conversions API (CAPI)** server-side e Pixel Client-side com deduplicação por `eventId`.

## Próximos Passos Sugeridos
- Escalar campanhas de Catálogo Dinâmico no Meta Ads com os vídeos já aprovados e gerados nas rotas individuais.
- Monitorar conversões por canal no painel de Analytics (`/dashboard/analytics`).
- **Monetização & Pagamento Automático:** Implementar cobrança utilizando **Efí Bank com Bolix** (Boleto + Pix em um único QR Code/código com baixa e pagamento automático via Webhook).
