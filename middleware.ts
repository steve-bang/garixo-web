import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const roleAccess: Record<string, Array<'admin' | 'staff' | 'user'>> = {
  '/dashboard/users': ['admin', 'staff']
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const restrictedRoute = Object.entries(roleAccess).find(([route]) =>
    pathname.startsWith(route)
  );

  if (restrictedRoute) {
    const [, allowedRoles] = restrictedRoute;
    const role = token.role as 'admin' | 'staff' | 'user' | undefined;

    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
