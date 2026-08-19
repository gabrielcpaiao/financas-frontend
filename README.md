# financas-frontend

Frontend em Nuxt 3 + Nuxt UI + Tailwind (via Nuxt UI) + Pinia, consumindo a API do `financas-backend`.

## Rodando localmente

1. `npm install`
2. Configure a URL da API se for diferente do padrão:
   - `NUXT_PUBLIC_API_BASE=http://localhost:8080/api/v1`
3. `npm run dev` → http://localhost:3000

## O que já está implementado

- `pages/login.vue` — tela de login, chama `POST /auth/login`
- `pages/index.vue` — dashboard "Geral", chama `GET /dashboard/summary?month=YYYY-MM`
- `stores/auth.ts` — sessão (token JWT), persistida em `localStorage`
- `composables/useApi.ts` — cliente HTTP central (injeta token, trata 401)
- `middleware/auth.global.ts` — protege todas as rotas exceto `/login`
- `app.config.ts` — paleta de cores (teal/verde/vermelho/âmbar) definida na etapa de design

## Próximas páginas a implementar (seguindo escopo-mvp.md)

`pages/transactions/index.vue`, `pages/credit-cards/index.vue`, `pages/credit-cards/[id].vue` —
use `useApi()` + `useAsyncData` do jeito que `pages/index.vue` já demonstra.
