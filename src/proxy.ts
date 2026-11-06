import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/compte", "/comptes", "/signalements", "/imports"];

function protectedPath(pathname: string): boolean {
  return PROTECTED.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

async function authenticated(request: NextRequest): Promise<boolean> {
  const cookie = request.headers.get("cookie") ?? "";
  if (!cookie.includes("SESSION=")) {
    return false;
  }
  try {
    const response = await fetch(new URL("/api/auth", process.env.BACKEND_URL ?? "http://localhost:8080"), {
      headers: { cookie },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = await authenticated(request);

  if (protectedPath(pathname) && !signedIn) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }
  if (pathname === "/connexion" && signedIn) {
    return NextResponse.redirect(new URL("/signalements", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/compte",
    "/compte/:path*",
    "/comptes",
    "/comptes/:path*",
    "/signalements",
    "/signalements/:path*",
    "/imports",
    "/imports/:path*",
    "/connexion",
  ],
};
