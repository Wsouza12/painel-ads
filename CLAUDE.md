# Contexto do Projeto: Painel Ads (Sistema ML)

**Para a IA:** Você está assumindo o desenvolvimento de um projeto Next.js focado na criação de Páginas Ponte e Feed XML de Catálogo para arbitragem no Mercado Livre com tráfego do Meta Ads. Leia atentamente as informações abaixo antes de propor qualquer mudança.

## Stack e Arquitetura
- **Framework:** Next.js (App Router, Edge & Node runtimes).
- **Estilização:** TailwindCSS.
- **Banco de Dados:** Supabase.
- **Linguagem:** TypeScript.

## Funcionalidades e Regras de Negócio

### 1. Páginas Ponte (`app/p/[id]/page.tsx`)
- Funcionam como interceptadores antes de enviar o cliente ao Mercado Livre.
- **Design:** Moderno, utilizando Glassmorphism (`backdrop-blur`, borders translúcidas).
- **Comportamento do Botão de Compra (`BuyButton.tsx`):**
  - O redirecionamento **nunca é automático** na carga da página.
  - Ao clicar no botão "Comprar agora", um modal com fundo de vidro aparece informando "Redirecionando para ambiente seguro".
  - O modal fica na tela por 3 segundos antes do redirecionamento efetivo.

### 2. Rastreamento e Meta CAPI (`app/api/pixel/capi/route.ts` e `PixelTracker.tsx`)
- O sistema possui **Meta Conversions API (CAPI)** implementada no backend.
- O Frontend passa eventos (`ViewContent`, `InitiateCheckout`) e **UTMs** via requisição POST para a rota interna CAPI.
- **Micro-eventos no frontend:** 
  - `ViewedContent_5s` (Dispara após 5 segundos).
  - `ScrolledPage_50` (Dispara em 50% de scroll).
- O sistema sempre envia um `eventId` único em chamadas CAPI e chamadas front-end (`window.fbq`) para deduplicação no Facebook.

### 3. O "Santo Graal" das Compras (Purchase API Sync)
- Em `lib/sync.ts` e `lib/ml.ts`, há uma lógica de robô chamada via **Cron Job da Vercel** (`/api/cron/sync` configurado no `vercel.json` para cada 15min).
- O Cron pesquisa os pedidos pagos recentes via API do Mercado Livre (`/orders/search`).
- Caso um pedido seja novo, o sistema dispara o evento de `Purchase` para o CAPI (Offline Conversions).
- Para evitar duplicidade de envio, os IDs dos pedidos rastreados são salvos na tabela Supabase `ml_orders_tracked`.

### 4. Feed de Catálogo XML (`app/api/ml/feed/single/[id]/route.ts`)
- O sistema gera um catálogo formato Meta Ads (`lib/meta-feed.ts`).
- Identifica dinamicamente Testes A/B injetando Labels:
  - `custom_label_0` é `Variante A`, `Variante B` ou `Normal`.
  - `custom_label_1` é marcado como `Teste AB`.

## Próximas Atualizações (Guia para IA)
- Antes de codar algo novo, sempre verifique o código existente nesses arquivos mencionados.
- Sempre cuide de tratar as chamadas do ML SDK para lidar com token expirado.
- Mantenha a estética de Glassmorphism.
- Ao atualizar o backend (CAPI ou Sync), lembre-se que o Supabase admin SDK e o Vercel Edge Runtime devem ser compatíveis, mas a rota de `track` não pode usar chamadas dinâmicas incompatíveis com prerendering se for tentar build estático.
