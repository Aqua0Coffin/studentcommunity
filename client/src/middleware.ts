import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // NOTE: This is the server-side Security Gate.
  // Because the prototype currently uses client-side Supabase auth (localStorage),
  // the primary Role-Based Access Control (RBAC) securely redirects unauthorized users
  // inside `src/app/admin/layout.tsx` which has access to the full User object.

  // If migrated to @supabase/ssr, the cookie validation logic would be activated here:
  // const supabase = createServerClient(...)
  // const { data: { session } } = await supabase.auth.getSession()
  // if (session.user.role === 'STUDENT') return NextResponse.redirect(new URL('/dashboard', request.url))

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
