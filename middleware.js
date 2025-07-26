import { NextRequest, NextResponse } from "next/server";
import { globalPB } from "@/lib/pb/global";
import { LOGIN, REGISTER, DASHBOARD } from "@/constants/page-routes";
import PBAuth from "@/lib/pb/auth";
import { cookies } from "next/headers";

export async function middleware(req) {
  const cookieStore = await cookies();
  const isLoggedIn = PBAuth.isAuthenticated(cookieStore, globalPB);
  globalPB.authStore.clear();

  const path = req.nextUrl.pathname;
  const isAuthPage = path === LOGIN || path === REGISTER;
  const isAddingAccount = req.nextUrl.searchParams.get('addAccount') === 'true';

  if (isAuthPage) {
    if (isLoggedIn && !isAddingAccount) {
      return NextResponse.redirect(new URL(DASHBOARD, req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const requestedUrl = path + req.nextUrl.search;
    return requestedUrl === DASHBOARD
      ? NextResponse.redirect(new URL(LOGIN, req.url))
      : NextResponse.redirect(
          new URL(`${LOGIN}?redirect=${encodeURIComponent(requestedUrl)}`, req.url)
        );
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
