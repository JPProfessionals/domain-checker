# AGENTS.md

Compact guidance for agents working in this repo.

## Commands

```bash
pnpm install
pnpm dev
pnpm test
pnpm test:coverage
pnpm lint
pnpm typecheck
pnpm build
pnpm preview    # wrangler pages
pnpm deploy
```

Requires Node **22.17+** and pnpm **9.x** (`packageManager` field).

## Stack

- Nuxt 4, Nuxt UI, Tailwind, i18n (en / de), nuxt-security, Zod
- Static deploy to **Cloudflare Pages** via Wrangler
- Live: https://domain.jpprofessionals.de

## Critical conventions

- Availability is a **DNS heuristic** (NS + SOA via Cloudflare DoH), not a registrar / RDAP API.
- Fail-closed on lookup errors (treat as not available).
- Always keep the “confirm with a registrar” caveat if you touch copy about results.
- TLD list: `data/tlds.json`. Validation: `utils/domainValidation.ts`.
