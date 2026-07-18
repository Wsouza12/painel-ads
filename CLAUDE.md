# CLAUDE.md — ml-meta-sync

Instruções de contexto pra qualquer sessão do Claude Code trabalhando neste projeto. Leia isso antes de tocar em qualquer arquivo.

## O que é o projeto

App Next.js 14 (App Router, TypeScript, Tailwind) que:
1. Conecta via OAuth numa conta do Mercado Livre.
2. Puxa todos os anúncios ativos via API do ML.
3. Gera um feed CSV no formato exigido pelo Meta Commerce Manager.
4. Sobe esse feed no Supabase Storage (bucket público) e expõe a URL.
5. Roda tudo automaticamente via Vercel Cron a cada 6h.
6. Tem um dashboard (`/dashboard`) pra status manual e sync sob demanda.

Uso atual: pessoal, single-tenant (uma linha só na tabela `ml_connections`). Objetivo futuro: pode virar produto vendável — ver seção "Próximo passo" abaixo.

## Stack

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage), acessado só via `service_role` no server (nunca expor no client)
- Deploy: Vercel (cron nativo via `vercel.json`)
- Sem ORM — queries diretas via `@supabase/supabase-js`

## Estrutura de arquivos (não reorganizar sem necessidade)

```
app/api/ml/connect/route.ts   → inicia OAuth
app/api/ml/callback/route.ts  → troca code por token, salva ml_connections
app/api/ml/sync/route.ts      → rota de cron (protegida por CRON_SECRET)
app/api/ml/sync/manual/route.ts → trigger manual (botão do dashboard)
app/dashboard/page.tsx        → UI de status
lib/ml.ts                     → toda chamada à API do Mercado Livre
lib/meta-feed.ts              → transformação ML → formato Meta + CSV
lib/sync.ts                   → orquestração (usada por cron E manual)
lib/supabase.ts               → client admin
supabase/schema.sql           → schema — rodar manualmente no SQL Editor, não há migration runner configurado ainda
```

## Regras de negócio importantes (não quebrar)

1. **Refresh token do ML rotaciona a cada uso.** `lib/ml.ts` → `refreshAccessToken()` SEMPRE salva o novo `refresh_token` retornado no banco. Se alguém tentar "otimizar" isso guardando o token em `.env`/variável estática, o próximo sync quebra. Não mexer nesse comportamento.
2. **`lib/sync.ts` é a única fonte de verdade da orquestração.** Tanto `sync/route.ts` (cron) quanto `sync/manual/route.ts` chamam `syncAllConnections()`. Não duplicar a lógica de sync direto numa rota.
3. **`ml_connections.user_id` é nullable de propósito.** Hoje fica `null`. É o hook pra multi-tenant — não remover a coluna, não preencher com valor fake.
4. **`link` do feed aponta pro permalink do ML**, não pra um site próprio (o usuário não tem loja própria ainda). Se isso mudar, editar `toMetaRow()` em `lib/meta-feed.ts`.
5. **Rota `/api/ml/sync` (cron) exige header `Authorization: Bearer $CRON_SECRET`.** Vercel injeta isso sozinho em cron jobs configurados em `vercel.json`. Não remover essa checagem.

## Próximo passo em andamento: domínio próprio + login

O usuário vai:
- Apontar um domínio próprio pro deploy (Vercel).
- Adicionar autenticação (login) na aplicação.

Quando isso for implementado:
- Login = Supabase Auth (mais direto, já está no stack).
- `ml_connections.user_id` passa a ser preenchido no callback OAuth com `auth.uid()` da sessão.
- Precisa de RLS policy em `ml_connections` e `sync_logs` filtrando por `user_id = auth.uid()`.
- O dashboard hoje pega "a primeira conexão" (`connections?.[0]`) — isso precisa virar "a conexão do usuário logado".
- `ML_REDIRECT_URI` no `.env` precisa apontar pro domínio novo, e isso também precisa bater com o que está cadastrado no Devcenter do Mercado Livre (senão o OAuth quebra com erro de redirect_uri_mismatch).

Não implementar login especulativamente antes de receber instrução explícita — só documentar aqui que é o próximo passo esperado.

## Protocolo de execução

Antes de qualquer ação (criar/editar arquivo, rodar migration, instalar dependência), gerar um PRE-EXECUTION REPORT curto: o que vai ser feito, quais arquivos são afetados, e esperar confirmação explícita antes de prosseguir. Não pular esse passo mesmo em mudanças que pareçam triviais.

Preferências gerais do usuário: código completo e executável, sem explicação excessiva, automação em vez de passo manual repetido.
