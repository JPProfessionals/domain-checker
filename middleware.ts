// Vercel Routing Middleware (runs at the edge before the static cache).
// First visit to "/" from DE/AT/CH → 307 to "/de". A manual language choice
// (cookie `dc_locale`, set by the locale switcher) always wins. Crawlers are
// never redirected, so "/" stays indexable as EN and hreflang stays intact.

export const config = { matcher: '/' }

const DACH = new Set(['DE', 'AT', 'CH'])
const LOCALE_COOKIE = 'dc_locale'
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|discord|preview|lighthouse|pagespeed|headless/i

export default function middleware(request: Request): Response | undefined {
  if (request.method !== 'GET' && request.method !== 'HEAD') return undefined

  const ua = request.headers.get('user-agent') ?? ''
  if (!ua || BOT_RE.test(ua)) return undefined

  const cookie = request.headers.get('cookie') ?? ''
  if (new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=`).test(cookie)) return undefined

  const country = (request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry') ?? '').toUpperCase()
  if (!DACH.has(country)) return undefined

  const url = new URL(request.url)
  url.pathname = '/de'
  return new Response(null, {
    status: 307,
    headers: {
      'Location': url.toString(),
      'Cache-Control': 'private, no-store',
      'Vary': 'Cookie, User-Agent',
    },
  })
}
