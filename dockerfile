# Build stage
FROM node:22.17.0-slim AS build
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.x

# Set environment variables for Nuxt UI Pro license and public site URL
ARG NUXT_UI_PRO_LICENSE
ENV NUXT_UI_PRO_LICENSE=$NUXT_UI_PRO_LICENSE
ARG NUXT_PUBLIC_SITE_URL
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22.17.0-slim
WORKDIR /app

# Copy the build output from the build stage
COPY --from=build /app/.output ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server/index.mjs"]
