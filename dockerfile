# Static site image: build with Nuxt (Cloudflare Pages static preset),
# serve pre-rendered assets with nginx. Prefer Cloudflare Pages for production.

# ---- Build ----
FROM node:24.11.1-slim AS build
WORKDIR /app

RUN npm install -g pnpm@9.x

ARG NUXT_PUBLIC_SITE_URL=https://domain.jpprofessionals.de
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ---- Runtime (static files only) ----
FROM nginx:1.27-alpine

# Drop default site config; use SPA-friendly static hosting.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# nginx official image runs workers as non-root (nginx user); master needs root for bind.
# Run as non-root by switching listen to 8080 and using the nginx user.
RUN chown -R nginx:nginx /usr/share/nginx/html \
  && chown -R nginx:nginx /var/cache/nginx \
  && chown -R nginx:nginx /var/log/nginx \
  && touch /var/run/nginx.pid \
  && chown nginx:nginx /var/run/nginx.pid

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
