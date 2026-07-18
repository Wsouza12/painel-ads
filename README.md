# ML → Meta Catalog Sync

App que conecta sua conta do Mercado Livre, sincroniza os anúncios ativos com um feed no formato do Meta Commerce Manager, e hospeda esse feed automaticamente. Pensado pra uso pessoal hoje, mas com o schema já preparado pra virar multi-tenant (SaaS) sem reescrever nada — só adicionar auth por cima.

## Por que essa estrutura e não só um script

- **Token em banco, não em `.env`**: o refresh_token do ML rotaciona a cada uso. Guardar num arquivo estático quebra depois do primeiro cron automatizado. Guardando na tabela `ml_connections`, cada sync já lê e salva o token mais recente sozinho.
- **`user_id` nullable na tabela**: hoje fica null (você usa uma conexão só). Se decidir vender, é só criar auth (Supabase Auth), preencher esse campo e adicionar uma RLS policy — o resto do app não muda.
- **Dashboard separado do sync**: você vê status, força um sync manual e pega a URL do feed sem precisar abrir terminal.

## 1. Setup

```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir
# depois copie os arquivos deste projeto (app/, lib/, vercel.json) por cima
npm install @supabase/supabase-js
cp .env.example .env.local
```

## 2. Banco (Supabase)

1. Crie um projeto em supabase.com.
2. Rode `supabase/schema.sql` no SQL Editor do projeto.
3. Crie um bucket **público** chamado `meta-catalog-feed` em Storage.
4. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (a service role key fica só no servidor, nunca no client).

## 3. App no Mercado Livre

1. Crie uma aplicação em developers.mercadolivre.com.br/devcenter.
2. Defina a **Redirect URI** exatamente igual ao que você vai colocar em `ML_REDIRECT_URI` (ex: `https://seuapp.vercel.app/api/ml/callback`).
3. Preencha `ML_CLIENT_ID` e `ML_CLIENT_SECRET`.

## 4. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000/dashboard` → clique em **Conectar Mercado Livre** → autorize → você volta pro dashboard já conectado.

Clique em **Sincronizar agora** pra rodar o primeiro sync manualmente e gerar a URL do feed.

## 5. Automatizar (produção)

Deploy na Vercel. Em Project Settings → Environment Variables, adicione todas do `.env.example` (com as URLs de produção). Gere um `CRON_SECRET` aleatório (`openssl rand -hex 32`).

O `vercel.json` já está configurado pra rodar `/api/ml/sync` a cada 6h — a Vercel injeta o header `Authorization: Bearer $CRON_SECRET` automaticamente em chamadas de cron, então não precisa configurar nada além da env var.

## 6. Configurar no Meta Commerce Manager

Pegue a URL mostrada no dashboard (campo "URL do feed") e cole em:
Commerce Manager → seu catálogo → Fontes de dados → Adicionar itens → Data feed → Scheduled feed → colar URL → definir frequência.

## Limitação atual (mesma de antes)

O `link` de cada produto no feed aponta pro permalink do próprio Mercado Livre — você não tem loja própria ainda. Isso funciona pro catálogo e pros anúncios dinâmicos, mas o Meta não enxerga a conversão final (ela acontece dentro do domínio do ML). Se migrar pra uma landing/checkout próprio no futuro, só troca o `link` no `meta-feed.ts` — o resto do pipeline continua igual.

## Se decidir vender depois

O que muda pra virar SaaS:
1. Adicionar Supabase Auth (login) na aplicação.
2. Preencher `user_id` em `ml_connections` no callback do OAuth.
3. Adicionar RLS policy filtrando `ml_connections` e `sync_logs` por `auth.uid()`.
4. Trocar o dashboard de "1 conexão fixa" pra listar as conexões do usuário logado.
5. Colocar um plano/cobrança (Stripe) antes de liberar o `/api/ml/connect`.

Nenhum desses pontos exige tocar em `lib/ml.ts`, `lib/meta-feed.ts` ou `lib/sync.ts` — a lógica de negócio já está desacoplada da camada de usuário.
