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

2. **Google Merchant Center & Google Ads (100% Verificado, Aprovado e Ativo):**
   - **Merchant Center:** Domínio `mercadoshops.up.railway.app` verificado no Google Merchant Center (ID `5827915218`, Conta `Zayhon`). **31 produtos aprovados com 100% de sucesso (0 reprovações)**.
   - **Google Ads - Conversões & Rastreamento (`AW-18351203132`):** Tag do Google Ads instalada nas Páginas Ponte com rastreamento automático de cliques de saída e conversões de compra, validada via Google Tag Assistant.
   - **Campanhas no Ar:** Campanha `Performance Max-1` (R$ 30/dia) qualificada e conectada ao catálogo do Merchant Center ("Produtos de Zayhon").

3. **Catálogos Dinâmicos com Vídeo para Meta Ads & Google Ads (`/api/ml/feed/[id]` e `/single/[id]`):**
   - Injeção automática das colunas de vídeo (`video_url`, `video`, `video[0].url`, `video[1].url`) nos feeds XML e CSV globais e individuais.
   - Suporte completo para campanhas de **Advantage+ Catalog no Meta Ads** exibindo vídeos em movimento no Reels e Stories.
   - Rótulos para Testes A/B (`custom_label_0` com `Variante A`, `Variante B` e `Normal`).

4. **Analytics de Atribuição de Origem & Meta CAPI de Alta Qualidade (EMQ 6.1/10):**
   - **Nota de Correspondência Meta (EMQ 6.1 / 10):** Pontuação 6.1/10 alcançada sem login ou e-mail, com envio de **100% de IP, 100% de User-Agent, 100% de `fbp` e 97.92% de `fbc`** (Facebook Click ID).
   - **Suporte Automático Google Ads (`GCLID` / UTMs):** Reconhecimento automático de parâmetros `gclid`, `gbraid`, `wbraid`, `gad_source`, `shopping` e `pmax` em `app/api/pixel/capi/route.ts` e `app/dashboard/analytics/page.tsx`, separando com precisão tráfego Google Ads e Meta Ads em tempo real.

## Próximos Passos Sugeridos
- Escalar campanhas de Catálogo Dinâmico no Meta Ads com os vídeos já aprovados e gerados nas rotas individuais.
- Monitorar conversões por canal no painel de Analytics (`/dashboard/analytics`).
- **Monetização & Pagamento Automático:** Implementar cobrança utilizando **Efí Bank com Bolix** (Boleto + Pix em um único QR Code/código com baixa e pagamento automático via Webhook).
