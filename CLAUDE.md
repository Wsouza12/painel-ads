# Contexto do Projeto: Painel Ads (Sistema ML -> Meta & Google Ads)

**Para a IA:** Você está atuando no desenvolvimento de um projeto Next.js focado em Páginas Ponte de altíssima conversão, arbitragem com tráfego pago (Meta Ads e Google Ads) e Feeds XML de Catálogo Dinâmico com vídeo para o Mercado Livre. Leia atentamente as informações abaixo antes de propor qualquer mudança.

## Stack e Arquitetura
- **Framework:** Next.js (App Router, Edge & Node runtimes).
- **Estilização:** TailwindCSS + Glassmorphism.
- **Banco de Dados:** Supabase (`ml_products`, `ml_ab_tests`, `pixel_events_log`).
- **Storage de Vídeos:** Cloudflare R2 (vídeos 9:16, 4:5 e 1:1 de alta conversão).
- **Hospedagem & Deploy:** Railway (`mercadoshops.up.railway.app`). Dual-push simultâneo via Git para os repositórios `Wsouza12/painel-ads` e `Wsouza12/painel-ads-lomZ` no branch `main`.

## Funcionalidades e Regras de Negócio

### 1. Páginas Ponte & Vídeo Nativo (`app/p/[id]/page.tsx`)
- Interceptam o cliente antes da chegada ao Mercado Livre, eliminando a exibição de concorrentes antes do clique.
- **Player de Vídeo MP4 Nativo:** Se o produto possuir `custom_video_url` ou `custom_video_url_square`, a página exibe um player nativo HTML5 (`autoPlay muted loop playsInline controls`) no topo da oferta.
- **Comportamento do Botão de Compra e Deep Linking Mobile (`BuyButton.tsx`):**
  - **Efeito Flash (Redirecionamento em 0.8s):** O modal de transição abre em `100ms` e executa o redirecionamento em **`800ms` (0.8s)**, garantindo tempo para o disparo de eventos Pixel/CAPI antes de mudar de app.
  - **Deep Linking Nativo no Celular (Android/iOS):**
    - Em dispositivos Android, utiliza o schema **Android Intent** (`intent://...#Intent;scheme=https;package=com.mercadolibre;...;end;`) com fallback para o link oficial.
    - Em iOS, utiliza o Universal Link (`mercadolibre://item?id=MLB...`).
    - **Vantagem de Conversão:** O cliente abre direto no **App do Mercado Livre instalado no celular**, onde já está logado, finalizando o checkout sem pedido de senha e sem vitrine de concorrentes.
  - **No Desktop:** Redireciona para o link de checkout/comprar ou permalink oficial.

### 2. Rastreamento, Atribuição e Meta CAPI (`app/api/pixel/capi/route.ts` e `PixelTracker.tsx`)
- O sistema possui **Meta Conversions API (CAPI)** server-side de alto score e pixel front-end.
- Extrai e rastrea **UTMs** (`utm_source`, `utm_campaign`, `utm_medium`, `utm_content`).
- **Analytics ao Vivo (`app/dashboard/analytics/`):** Agrupa os eventos em tempo real separando conversões por origem de canal (Meta Ads, Google Ads e Direto).

### 3. Google Merchant Center & Google Ads
- **Domínio Reivindicado e Verificado:** Domínio `mercadoshops.up.railway.app` certificado no Google Merchant Center (ID `5827915218`).
- Meta tags de verificação presentes em `app/layout.tsx`.
- **Política de Devolução:** Página oficial em `/politica-de-devolucao` documentando a Compra Garantida de 30 dias do Mercado Livre.
- Campanha `Performance Max-1` em operação no Google Ads.

### 4. Feeds XML Dinâmicos de Vídeo (`app/api/ml/feed/[id]/route.ts` e `/api/ml/feed/single/[id]/route.ts`)
- Geração automática de catálogos XML e CSV para Meta Ads e Google Ads.
- **Vídeos no Catálogo Dinâmico (Reels/Stories):** As rotas de feed injetam automaticamente as colunas `video_url`, `video` (JSON array), `video[0].url` e `video[1].url` de todos os produtos ou produtos individuais que possuam vídeos cadastrados no banco de dados.
- **Suporte a Testes A/B:** Injeta Custom Labels diferenciando `Variante A`, `Variante B`, `Normal` e `Teste AB`.

## Próximas Atualizações (Guia para IA)
- Sempre utilize `process.env.APP_URL || "https://mercadoshops.up.railway.app"` para gerar links absolutos.
- Ao atualizar o comportamento de mobile no `BuyButton.tsx`, preserve rigorosamente o `package=com.mercadolibre` para evitar vazamento para web browser não-logado.
- Mantenha sempre a documentação em sintonia e faça push para os dois repositórios no branch `main`.
