# Domain Checker

Lightning-fast, real-time domain availability checker powered by **DNS-over-HTTPS (DoH)**. Built with Nuxt 4 and Nuxt UI.

[Live Demo](https://domain.jpprofessionals.de) · [GitHub](https://github.com/JPProfessionals/domain-checker)

## Features

- Real-time availability checks via Cloudflare DoH (`1.1.1.1`)
- Multi-TLD picker with search, type filters, and virtual scrolling
- English & German (i18n)
- Responsive UI with dark mode (Nuxt UI)
- Client-side input validation (Zod) and TLD allowlisting
- Security headers / CSP via `nuxt-security`
- Static deploy to Cloudflare Pages (primary)
- Optional Docker image (nginx serving static assets)

## How availability is determined

Checks use a **DNS heuristic** (NS + SOA via DoH), not a registry or RDAP API:

| Signal | Interpretation |
|--------|----------------|
| NXDOMAIN / empty NS and SOA | Likely available |
| NS or SOA present | Likely taken |
| Lookup error | Treated as not available (fail-closed) |

Registered names without public NS, premium/reserved names, or registry holds can be misclassified. **Always confirm with a registrar before purchasing.**

## Tech stack

- **Nuxt 4** (static / Cloudflare Pages preset)
- **Nuxt UI** + Tailwind
- **@nuxtjs/i18n**, **@nuxtjs/seo**, **nuxt-security**
- **Zod** validation
- **Vitest** tests
- **pnpm** package manager
- **Wrangler** for Pages preview/deploy

## Prerequisites

- Node.js **22.17+** (CI uses Node 24)
- pnpm **9.x**

## Setup

```bash
git clone https://github.com/JPProfessionals/domain-checker.git
cd domain-checker
pnpm install
```

Create `.env` (see `.env.example`):

```env
NUXT_PUBLIC_SITE_URL=https://domain.jpprofessionals.de
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production static build |
| `pnpm preview` | Preview with Wrangler Pages |
| `pnpm deploy` | Deploy to Cloudflare Pages project `domain-checker` |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm typecheck` | TypeScript |
| `pnpm test` / `pnpm test:coverage` | Vitest |

## Production deploy (recommended)

Primary target is **Cloudflare Pages** (static output from Nitro preset `cloudflare-pages-static`):

```bash
pnpm build
pnpm deploy
```

Or connect the GitHub repo to Cloudflare Pages and set:

- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Output directory: `dist` (Nitro `cloudflare-pages-static` preset)
- Env: `NUXT_PUBLIC_SITE_URL`

## Docker (optional)

The image builds the static site and serves it with nginx on port **8080**:

```bash
docker build --build-arg NUXT_PUBLIC_SITE_URL=https://your-domain.com -t domain-checker .
docker run -p 8080:8080 domain-checker
```

Prefer Cloudflare Pages for production; Docker is for local/offline demos.

## Limits & validation

| Rule | Value |
|------|--------|
| Domain label length | 3–63 characters |
| Label charset | Alphanumeric + hyphens (no TLD in the input field) |
| TLDs per check | Max **50** (allowlisted from `data/tlds.json`) |
| DoH concurrency | 5 parallel lookups |
| Deep links | `?search=` and `?tlds=` are validated / allowlisted before auto-search |

## Environment variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NUXT_PUBLIC_SITE_URL` | Canonical public URL (SEO) | Recommended |
| `NODE_ENV` | `development` / `production` | Auto |

No third-party registrar API keys are required.

## Security notes

- No backend API or private secrets in the static build
- CSP and related headers configured via `nuxt-security`
- Query-string TLDs must match the static allowlist
- WHOIS open-links only accept safe domain hostnames

## CI

GitHub Actions (`CI`) on `main` and pull requests: install (frozen lockfile) → lint → typecheck → test with coverage → build.

---

Developed by [JPProfessionals](https://jpprofessionals.de)
