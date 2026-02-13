import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const reportRoutes = [
    '/reports/ranking',
    '/reports/categories',
    '/reports/top-customers',
    '/reports/inventory',
    '/reports/user-activity',
    '/reports/order-summary',
    '/reports/daily-sales'
  ];

  for (const route of reportRoutes) {
    if (pathname.startsWith(route) && pathname !== route) {
      const segments = pathname.replace(route + '/', '').split('/');
      const params = new URLSearchParams();

      for (let i = 0; i < segments.length; i++) {
        if (segments[i] === 'page' && segments[i + 1]) {
          params.set('page', segments[i + 1]);
          i++;
        } else if (segments[i] === 'search' && segments[i + 1]) {
          params.set('query', decodeURIComponent(segments[i + 1]));
          i++;
        }
      }

      const url = request.nextUrl.clone();
      url.pathname = route;
      url.search = params.toString();
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/reports/:path*',
};
