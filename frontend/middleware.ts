import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ar', 'en'];
const defaultLocale = 'ar';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If pathname has a locale prefix (like /en/...), redirect to the path without it
  // and set the locale cookie instead
  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1];
    const newPathname = pathname.replace(`/${locale}`, '') || '/';

    const response = NextResponse.redirect(new URL(newPathname, request.url));
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - Static files
    // - Next.js internals
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
