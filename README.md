![jpp-domain-checker-screenshot](https://github.com/JPProfessionals/domain-checker/blob/main/.github/domain-tool-mockup.png)

# Domain-Checker Tool

This tool allows you to easily check domain name availability directly from your web application, leveraging the GoDaddy API for real-time data. Designed with simplicity and efficiency in mind, it integrates seamlessly into your projects.

[![Nuxt UI Pro](https://img.shields.io/badge/Made%20with-Nuxt%20UI%20Pro-00DC82?logo=nuxt.js&labelColor=020420)](https://ui.nuxt.com/pro)

[Live Demo](https://domain.jpprofessionals.de)

## Features

- ✅ Real-time domain availability checking via GoDaddy API
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
- GoDaddy API credentials (for domain checking)

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
GODADDY_API_KEY=your_api_key_here
GODADDY_API_SECRET=your_api_secret_here
NUXT_UI_PRO_LICENSE=your_license_key_here
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

Preview the production build locally:

```bash
pnpm run preview
```

### Docker Deployment

Build and run with Docker:

```bash
docker build --build-arg NUXT_UI_PRO_LICENSE=your_license --build-arg NUXT_PUBLIC_SITE_URL=https://your-domain.com -t domain-checker .
docker run -p 3000:3000 -e GODADDY_API_KEY=your_key -e GODADDY_API_SECRET=your_secret domain-checker
```

## Configuration

### API Limits & Performance

The application includes built-in performance optimizations and limits to prevent memory issues:

- **TLD List**: Maximum 1000 TLDs loaded at once (default: 500)
- **Domain Checks**: Maximum 100 TLDs per request
- **Domain Name Length**: Maximum 63 characters (RFC 1035 compliant)
- **Total Domain Length**: Maximum 253 characters
- **TLD Cache**: 1 hour in-memory cache for TLD list
- **API Timeouts**: 
  - TLD API: 10 seconds
  - GoDaddy API: 30 seconds

### Rate Limiting

- **Development**: 100 requests per 10 seconds
- **Production**: 5 requests per 10 seconds

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GODADDY_API_KEY` | GoDaddy API key | Yes |
| `GODADDY_API_SECRET` | GoDaddy API secret | Yes |
| `NUXT_UI_PRO_LICENSE` | Nuxt UI Pro license key | Yes |
| `NUXT_PUBLIC_SITE_URL` | Public site URL for SEO | Recommended |
| `NODE_ENV` | Environment mode (development/production) | Auto |

## Using the Domain-Checker Tool

1. **Input Domain Name**: Enter the domain name you wish to check (3-63 characters)
2. **Select TLDs**: Choose from available TLDs using the searchable picker (max 100 TLDs)
3. **Check Availability**: Click search or press Enter to check domain availability
4. **View Results**: Results show whether each domain is available or already taken

## Project Structure

```
domain-checker/
├── server/
│   └── api/
│       ├── checkDomains.post.ts    # Domain availability API
│       └── getTlds.post.ts          # TLD list API with caching
├── pages/
│   └── index.vue                   # Main application page
├── types/
│   └── domain.ts                   # TypeScript type definitions
├── i18n/
│   └── i18n.config.ts              # Internationalization config
└── nuxt.config.ts                   # Nuxt configuration
```

## Performance Optimizations

- ✅ **In-memory caching** for TLD lists (1 hour TTL)
- ✅ **Request size limits** to prevent memory exhaustion
- ✅ **API timeouts** to prevent hanging requests
- ✅ **Input validation** for domain names and TLD counts
- ✅ **Virtual scrolling** for large TLD lists
- ✅ **Rate limiting** to prevent abuse
- ✅ **Production optimizations** (devtools disabled)

## Security Features

- Request size limits
- Rate limiting
- Input validation and sanitization
- Security headers (CORS, X-Content-Type-Options)
- Environment variable validation

## Browser Support

Modern browsers that support:
- ES6+
- CSS Grid & Flexbox
- Fetch API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

Created with ❤️ by [JPProfessionals](https://jpprofessionals.de)

For deployment guidance, refer to the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).
