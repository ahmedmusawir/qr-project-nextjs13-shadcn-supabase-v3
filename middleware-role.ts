import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  await updateSession(request);
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  const response = NextResponse.next();

  // Set Cache-Control headers
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const userRoles = data.user.user_metadata;
  if (
    request.nextUrl.pathname.startsWith("/superadmin-portal") &&
    userRoles.is_qr_superadmin !== 1
  ) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (
    request.nextUrl.pathname.startsWith("/admin-portal") &&
    userRoles.is_qr_admin !== 1
  ) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (
    request.nextUrl.pathname.startsWith("/members-portal") &&
    userRoles.is_qr_member !== 1
  ) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/superadmin-portal/:path*",
    "/admin-portal/:path*",
    "/members-portal/:path*",
  ],
};
