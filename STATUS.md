# Status do Projeto: Painel Ads (Sistema ML -> Meta & Google Ads -> E-commerce Próprio)
**Última Atualização:** 02 de Agosto de 2026

## O que é o projeto?
O **"Painel Ads"** é uma plataforma avançada de arbitragem, dropshipping e tráfego pago integrada ao ecossistema do Mercado Livre e agora com um **E-commerce Autônomo Próprio**. O sistema opera como uma **"Ponte" Inteligente** entre o tráfego de anúncios (Meta Ads, Instagram Reels/Stories e Google Ads) e a finalização de compras (seja via redirect seguro para o ML, seja via Checkout próprio com EFI Bank).

## Stack e Hospedagem
- **Hospedagem Principal:** Railway (`mercadoshops.up.railway.app`).
- **Repositórios (Git Dual-Push):** `Wsouza12/painel-ads` e `Wsouza12/painel-ads-lomZ` no branch `main`.
- **Frontend:** Next.js (App Router), React, TailwindCSS, Glassmorphism.
- **Backend/Auth:** Next.js Route Handlers + Supabase (`ml_products`, `ml_ab_tests`, `pixel_events_log`, `customers`, `orders`).
- **Armazenamento de Vídeo:** Cloudflare R2.
- **Integrações de Pagamento:** EFI Bank (PIX Integrado, com Cartão e Boleto mapeados).

## Principais Realizações e Funcionalidades Ativas

1. **E-commerce Completo & Checkout Multi-step (`/checkout/[productId]`):**
   - Transição de landing page simples para e-commerce robusto.
   - Fluxo de identificação (Nome, CPF, Telefone), Endereço e Pagamento.
   - **Integração EFI Bank:** Geração de cobranças PIX automatizadas com QR Code e sistema Copia e Cola direto na tela de sucesso, com fallback de segurança.

2. **Portal do Cliente & Painel Administrativo:**
   - **Rastreio de Pedidos (`/meus-pedidos`):** Interface pública para o cliente buscar o status da compra e o código de rastreio usando apenas o CPF.
   - **Dashboard Admin (`/dashboard/pedidos`):** Painel do lojista exibindo faturamento, total de pedidos, controle de envios e campo para inserir código de rastreio (alterando automaticamente o status do pedido para 'enviado').

3. **Páginas Ponte de Alta Conversão & Player MP4 Nativo (`app/p/[id]/page.tsx`):**
   - Player HTML5 MP4 nativo no topo do produto (autoPlay, muted, loop, playsInline) para vídeos verticais (9:16) e quadrados (1:1).
   - **Deep Linking Nativo no Celular:** Abertura garantida do **aplicativo oficial do Mercado Livre (`com.mercadolibre`)** em Android e iOS para fluxos de checkout via ML.

4. **Google Merchant Center & Google Ads (100% Verificado, Aprovado e Ativo):**
   - **Merchant Center:** Domínio certificado. **31 produtos aprovados com 100% de sucesso**.
   - **Google Ads - Conversões & Rastreamento (`AW-18351203132`):** Tag do Google Ads instalada nas Páginas Ponte com rastreamento automático.
   - **Campanhas no Ar:** Campanha `Performance Max-1` (R$ 30/dia) qualificada e conectada ao catálogo.

5. **Analytics de Atribuição de Origem & Meta CAPI de Alta Qualidade (EMQ 6.1/10):**
   - Pontuação 6.1/10 no CAPI, separação precisa de tráfego Google Ads e Meta Ads em tempo real via GCLID e UTMs.
   - Catálogos Dinâmicos com vídeos injetados nos arquivos XML/CSV.

## Próximos Passos Sugeridos
- Escalar campanhas de Catálogo Dinâmico no Meta Ads apontando para a nova URL de loja/checkout.
- **Cartão de Crédito e Boleto EFI:** Implementar o script frontend `pay.js` da EFI para aprovação de cartões e geração de boletos no novo checkout (a rota de API e frontend já preveem essas opções).
- Automatizar baixa de estoque e pós-venda.
