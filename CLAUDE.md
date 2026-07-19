# Contexto do Projeto: Painel de Ads & Integração Mercado Livre

## 🎯 Objetivo do Sistema
Plataforma desenvolvida para dropshippers otimizarem campanhas no Facebook Ads (Meta Ads) utilizando o modelo de negócio do Mercado Livre, mas com controle total do funil de tráfego, rastreamento (Pixel) e aparência do produto através de "Páginas Ponte".

## 🏗️ Arquitetura
- **Frontend/Backend:** Next.js (React) com App Router.
- **Banco de Dados:** Supabase (PostgreSQL).
- **Hospedagem:** Vercel (https://painel-ads-one.vercel.app).
- **Estilização:** Tailwind CSS.

## 🔗 Principais Funcionalidades
1. **Importação do Mercado Livre:** Captura dados de um anúncio original do Mercado Livre (Preço, Título, Link, Imagens) usando a API pública.
2. **Edição Estratégica (Painel):** O usuário pode customizar a "Capa" do produto (fazer upload de uma imagem chamativa) e editar o preço para criar percepção de ancoragem/desconto, gerando uma nova Página Ponte exclusiva.
3. **Página Ponte de Alta Conversão:** Uma página intermediária que:
   - Exibe os dados otimizados.
   - Carrega o Pixel da Meta (`PageView`, `ViewContent`).
   - Ao clicar em "Comprar", abre um modal nativo passando segurança e aciona uma contagem regressiva de 5 segundos.
   - Dispara o evento de `InitiateCheckout` na hora do redirecionamento.
   - Redireciona o usuário (com o link de afiliado/original) para o Mercado Livre.
4. **Catálogo Dinâmico (Facebook):** Rota da API (`/api/catalog/fb`) que gera automaticamente um arquivo XML (RSS) com todos os produtos editados para serem usados em Campanhas de Vendas de Catálogo Dinâmico (Advantage+) no Meta Ads. O catálogo bloqueia intencionalmente imagens nativas extras do ML para forçar o FB a exibir apenas as capas com alta conversão.

## 🛠️ Banco de Dados (Supabase)
Tabela principal: `ml_products`
- `id` (UUID)
- `ml_item_id` (String - ID original do ML)
- `original_title` / `custom_title` (String)
- `original_price` / `custom_price` (Float)
- `original_image_url` / `custom_image_url` (String)
- `original_permalink` (String)
- `created_at` (Timestamp)
- `meta_pixel_id` (String - Para o rastreamento dinâmico)

## 📌 Regras de IA (Diretrizes para Assistentes)
- **Modificações de Layout:** Sempre priorizar um design limpo e de alta confiança ("estilo nativo" ou Premium). A página ponte e o painel de integração foram estilizados com as cores do ML.
- **Ferramentas de Bash:** Evitar uso desnecessário de ferramentas amplas se houver ferramenta específica (Ex: preferir `replace_file_content` para edição).
- **Catálogo:** Não incluir `additional_image_link` com as fotos do ML para evitar sujeira visual no carrossel do Meta Ads.
