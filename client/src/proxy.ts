import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'experimental-edge';

export async function proxy(request: NextRequest) {
  // Server-side Security Gate.
  // Primary RBAC is handled client-side in src/app/admin/layout.tsx.
  // Activate cookie-based auth here when migrating to @supabase/ssr.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
