# STATUS.md — ml-meta-sync

Última atualização: 16/07/2026

## ✅ Pronto

- [x] Schema do banco (`ml_connections`, `sync_logs`) — arquivo pronto, **ainda não rodado no Supabase real**.
- [x] Fluxo OAuth completo (connect → callback → salva conexão).
- [x] Client da API do ML (`lib/ml.ts`) — listagem paginada, detalhes em lote, descrição, refresh de token com persistência.
- [x] Transformação pro formato de feed do Meta (`lib/meta-feed.ts`) — campos: id, title, description, availability, condition, price, link, image_link, brand.
- [x] Orquestração de sync (`lib/sync.ts`) — usada por cron e trigger manual.
- [x] Upload automático do feed pro Supabase Storage.
- [x] Rota de cron protegida por `CRON_SECRET` (`vercel.json` configurado, 6/6h).
- [x] Dashboard básico (`/dashboard`) — status da conexão, últimas sincronizações, botão de sync manual.

## 🚧 Pendente (próximos passos, nessa ordem)

1. **Rodar `supabase/schema.sql`** num projeto Supabase real e criar o bucket público `meta-catalog-feed`.
2. **Cadastrar app no Devcenter do Mercado Livre** e configurar a Redirect URI.
3. **Testar o fluxo local** (`npm run dev` → `/dashboard` → conectar → sync manual) antes de qualquer deploy.
4. **Domínio próprio** — apontar domínio no Vercel, atualizar `APP_URL` e `ML_REDIRECT_URI` nas env vars de produção, e atualizar a Redirect URI cadastrada no Devcenter do ML pra bater exatamente com a nova URL (isso costuma ser o ponto de erro mais comum: `redirect_uri_mismatch`).
5. **Login (Supabase Auth)** — ver seção "Próximo passo" do `CLAUDE.md` pra escopo detalhado. Ainda não iniciado.
6. **RLS policies** em `ml_connections` e `sync_logs` — depende do login estar implementado primeiro.
7. Deploy em produção na Vercel com todas as env vars configuradas + teste do cron rodando de verdade (a primeira execução automática só acontece no horário agendado, então validar o schedule do `vercel.json` bate com o esperado).

## ⚠️ Bloqueios / decisões em aberto

- Nenhum bloqueio técnico no momento. O que falta é sequenciamento: banco → app ML → teste local → domínio → login.
- Decisão em aberto (não urgente): se o produto for vendido futuramente, definir se cobrança entra antes ou depois do login (afeta se `/api/ml/connect` fica livre ou atrás de um paywall).

## 🐛 Limitações conhecidas (não são bugs, são escopo)

- `link` do feed aponta pro permalink do próprio Mercado Livre — sem loja/checkout próprio, não dá pra medir conversão real (Purchase) via pixel, só até o clique.
- Dashboard pega a primeira conexão da tabela (`connections?.[0]`), não filtra por usuário — correto pra single-tenant, precisa mudar quando login entrar.
- Sem testes automatizados ainda.
