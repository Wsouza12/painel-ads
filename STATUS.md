# Status do Projeto: Painel Ads (Sistema ML)
**Última Atualização:** 21 de Julho de 2026

## O que é o projeto?
O "Painel Ads" é uma aplicação focada em arbitragem e dropshipping utilizando o ecossistema do Mercado Livre. Ele funciona como uma "Ponte" inteligente entre o tráfego pago (Meta Ads) e os anúncios do Mercado Livre. O sistema clona produtos do ML, permite edição de títulos/imagens/preços, gera páginas ponte de alta conversão para burlar bloqueios, e cria Feeds XML (Catálogos) otimizados para campanhas dinâmicas.

## Stack Tecnológico
- **Frontend:** Next.js (App Router), React, TailwindCSS.
- **Backend:** Next.js Route Handlers.
- **Banco de Dados/Auth:** Supabase.
- **Integrações:** Mercado Livre API (SDK), Meta Graph API (CAPI).
- **Hospedagem:** Vercel.

## Funcionalidades Principais Implementadas Recentes

1. **Páginas Ponte com Glassmorphism (UI Premium):**
   - Redesign completo das páginas de ponte e do card de produtos.
   - O redirecionamento automático foi removido. Agora a página atua como uma verdadeira ponte: o redirecionamento ocorre após o usuário clicar em "Comprar agora", com um modal elegante de carregamento seguro (3 segundos).

2. **Integração Meta Conversions API (CAPI) - "O Santo Graal":**
   - **Offline Conversions (Robô de Vendas):** Um Cron Job (rodando a cada 15min via Vercel) busca vendas recém-pagas na API do Mercado Livre e dispara um evento `Purchase` Server-to-Server para o Meta. Evita duplicidade usando a tabela `ml_orders_tracked`.
   - **Micro-Eventos de Engajamento:** Na página ponte, rastreamos `ViewedContent_5s` (tempo na página) e `ScrolledPage_50` (scroll da página) disparando via CAPI e FBQ.
   - **UTMs Dinâmicas:** A página ponte extrai os parâmetros UTM da URL e os injeta nos payloads do CAPI para otimização de campanhas avançadas.

3. **Catálogo XML com Custom Labels Dinâmicas:**
   - O Feed XML (usado no Meta Catalog) agora identifica automaticamente produtos que estão em Teste A/B.
   - Insere `custom_label_0` como `Variante A`, `Variante B` ou `Normal`.

## Próximos Passos Sugeridos
- Criação de um Dashboard (Analytics) interno no painel para visualizar ROAS, Cliques e Conversões usando os dados já armazenados no banco.
- Interface de gerenciamento de cupons dinâmicos.
