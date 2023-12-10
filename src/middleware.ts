import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session');

    if (!session) {
        if (request.nextUrl.pathname.startsWith('/auth')) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (request.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

//Add your appotected routes
export const config = {
    matcher: ['/', '/app/:path*', '/auth/:path*']
};
