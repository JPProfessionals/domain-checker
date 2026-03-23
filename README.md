# Domain-Checker Tool

This tool allows you to easily check domain name availability directly from your web application, leveraging native DoH (DNS-over-HTTPS) for real-time data. Designed with simplicity and efficiency in mind, it integrates seamlessly into your projects.

[Live Demo](https://domain.jpprofessionals.de)

## Features

- ✅ Real-time domain availability checking via lightning-fast native DoH (DNS-over-HTTPS)
- ✅ Multi-TLD support with searchable TLD picker
- ✅ Virtual scrolling for performance-optimized TLD list
- ✅ Internationalization (i18n) support (English & German)
- ✅ Responsive design with dark mode support
- ✅ Rate limiting and request validation
- ✅ In-memory caching for improved performance
- ✅ Docker support for easy deployment

## Prerequisites

- Node.js 22.17.0 or higher
- pnpm 9.x

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jpprofessionals/domain-checker.git
cd domain-checker
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
NUXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Development

### Start Development Server

Launch the development server at http://localhost:3000:

```bash
pnpm run dev
```

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build locally
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint errors automatically
- `pnpm run typecheck` - Run TypeScript type checking

## Production

### Build

Prepare the application for production:

```bash
pnpm run build
```

### Preview

## 🛠️ Tech Stack
- **Frontend**: Node.js / TypeScript
- **API Integration**: GoDaddy Domain API
- **Styling**: Tailwind CSS

## 🚀 Entwicklung
```bash
pnpm run preview
```

### Docker Deployment

Build and run with Docker:

```bash
docker build --build-arg NUXT_PUBLIC_SITE_URL=https://your-domain.com -t domain-checker .
docker run -p 3000:3000 domain-checker
```

## Configuration

### API Limits & Performance

The application includes built-in performance optimizations and limits to prevent memory issues:

- **TLD List**: Maximum 1000 TLDs loaded at once (default: 500)
- **Domain Checks**: Maximum 100 TLDs per request
- **Domain Name Length**: Maximum 63 characters (RFC 1035 compliant)
- **Total Domain Length**: Maximum 253 characters
- **TLD Cache**: 1 hour in-memory cache for TLD list
- **API Timeouts**: 10 seconds

### Rate Limiting

- **Development**: 100 requests per 10 seconds
- **Production**: 5 requests per 10 seconds

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NUXT_PUBLIC_SITE_URL` | Public site URL for SEO | Recommended |
| `NODE_ENV` | Environment mode (development/production) | Auto |

## Using the Domain-Checker Tool

1. **Input Domain Name**: Enter the domain name you wish to check (3-63 characters)
2. **Select TLDs**: Choose from available TLDs using the searchable picker (max 100 TLDs)
3. **Check Availability**: Click search or press Enter to check domain availability
4. **View Results**: Results show whether each domain is available or already taken

## Project Structure

# Entwicklungs-Server starten
npm run dev
```

---
*Developed by JP Professionals*