import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/"];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Next's static analysis (get-page-static-info.js) only ever looks for an export
// literally named `config` here, regardless of the file being named proxy.ts -
// `proxyConfig` is silently ignored and the matcher then defaults to "everything",
// which was redirecting every /_next/static/*.css and *.js request to "/".
//
// /referees, /referees/:id and /komisarioi are deliberately NOT listed here -
// they're public pages and must not go through the auth redirect at all.
export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/match-days",
    "/match-days/:path*",
    "/matches/:path*",
    "/admin/:path*",
    "/teams",
    "/arenas",
    "/my-assignments",
  ],
};
