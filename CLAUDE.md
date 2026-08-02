# Contexto do Projeto: Painel Ads (Sistema ML -> Meta & Google Ads -> E-commerce)

**Para a IA:** Você está atuando no desenvolvimento de um projeto Next.js focado em Páginas Ponte de altíssima conversão, arbitragem com tráfego pago (Meta Ads e Google Ads) e agora um **E-commerce Completo** com pagamentos diretos via EFI Bank. Leia atentamente as informações abaixo antes de propor qualquer mudança.

## Stack e Arquitetura
- **Framework:** Next.js (App Router, Edge & Node runtimes).
- **Estilização:** TailwindCSS + Glassmorphism.
- **Banco de Dados:** Supabase (`ml_products`, `ml_ab_tests`, `pixel_events_log`, `customers`, `orders`).
- **Storage de Vídeos:** Cloudflare R2 (vídeos 9:16, 4:5 e 1:1).
- **Integração Pagamento:** EFI Bank (PIX mTLS, Cartão, Boleto).
- **Hospedagem & Deploy:** Railway (`mercadoshops.up.railway.app`). Dual-push simultâneo via Git para os repositórios `Wsouza12/painel-ads` e `Wsouza12/painel-ads-lomZ` no branch `main`.

## Funcionalidades e Regras de Negócio

### 1. E-commerce Customizado e Checkout Próprio (`app/checkout/[productId]`)
- O botão principal de compra redireciona o usuário para um checkout nativo da plataforma.
- **Checkout Multi-step:** O cliente fornece Identificação, Endereço e seleciona o Método de Pagamento.
- **Processamento de Pagamento (`/api/checkout/process`):** Salva o cliente e o pedido no Supabase. Para PIX, faz a comunicação em tempo real via mTLS com a API do EFI Bank (`lib/efi.ts`) gerando um QR Code instantâneo.
- **Áreas Restritas / Portais:**
  - `/meus-pedidos`: Portal do Cliente (acesso via CPF) para acompanhar o status e o rastreio da compra.
  - `/dashboard/pedidos`: Painel Administrativo para o lojista verificar métricas (Faturamento, Total) e alterar status (ex: inserir código de rastreio).

### 2. Páginas Ponte & Vídeo Nativo (`app/p/[id]/page.tsx`)
- Interceptam o cliente antes da chegada ao Mercado Livre (se o fluxo for apontado pro ML).
- **Player de Vídeo MP4 Nativo:** Exibe um player HTML5 (`autoPlay muted loop playsInline controls`).
- **Deep Linking Nativo no Celular (Android/iOS):**
  - Utiliza o schema Android Intent (`intent://...#Intent;scheme=https;package=com.mercadolibre;...;end;`) com fallback.
  - O cliente abre direto no **App do ML**, finalizando compras sem pedido de senha e sem vitrine de concorrentes.

### 3. Rastreamento, Atribuição e Meta CAPI (`app/api/pixel/capi/route.ts`)
- O sistema possui **Meta Conversions API (CAPI)** server-side com score de **6.1/10 EMQ** (100% IP, User-Agent, fbp e **97.92% fbc**).
- Extrai e rastreia **UTMs** e códigos de clique pago do Google (`gclid`, `gbraid`, `wbraid`, `gad_source`, `shopping`, `pmax`).
- **Analytics ao Vivo (`app/dashboard/analytics/`):** Agrupa os eventos separando conversões por origem de canal (Meta Ads, Google Ads e Direto).

### 4. Google Merchant Center & Google Ads
- **Domínio Verificado:** Domínio `mercadoshops.up.railway.app` certificado no Merchant Center (ID `5827915218`). **31 produtos aprovados sem ressalvas**.
- **Política de Devolução:** Em `/politica-de-devolucao`.
- **Campanhas no Ar:** `Performance Max-1` ativa e qualificada (`AW-18351203132`).

### 5. Feeds XML Dinâmicos de Vídeo (`/api/ml/feed/[id]`)
- Geração automática de catálogos XML/CSV para Meta Ads e Google Ads.
- Injetam automaticamente as colunas de vídeo (`video_url`, `video[0].url`) para suportar **Advantage+ Catalog no Meta Ads** em Reels/Stories.
- Suporte a Testes A/B injetando Custom Labels (`Variante A`, `Variante B`).

## Próximas Atualizações e Aprendizados (Guia para IA)
- Ao manipular a API do **EFI Bank** (`lib/efi.ts`), lembre-se que o certificado foi convertido para Base64 (`EFI_CERT_BASE64`) para compatibilidade com o container do Railway. Qualquer nova rota de API de pagamento deve usar a classe `https.Agent` gerada nessa lib.
- Sempre utilize `process.env.APP_URL || "https://mercadoshops.up.railway.app"` para gerar links absolutos.
- Ao atualizar rotas administrativas ou de rastreio, evite APIs que impedem a compilação estática sem motivo (`dynamic-server-error`), prefira ler `searchParams` nativamente e ajustar a rota para `force-dynamic` quando estritamente necessário.
- Faça push sempre após concluir implementações funcionais fechadas e testadas.
