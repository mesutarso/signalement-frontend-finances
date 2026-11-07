import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/compte", "/comptes", "/signalements", "/imports", "/indices", "/journal", "/supervision", "/dossiers", "/courriers", "/points", "/primes", "/etats", "/contribuables", "/echantillons", "/tirages", "/declarants", "/indicateurs", "/corrections", "/reexamens", "/messages", "/regles"];

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
    "/indices",
    "/indices/:path*",
    "/journal",
    "/journal/:path*",
    "/supervision",
    "/supervision/:path*",
    "/dossiers",
    "/dossiers/:path*",
    "/courriers",
    "/courriers/:path*",
    "/points",
    "/points/:path*",
    "/primes",
    "/primes/:path*",
    "/etats",
    "/etats/:path*",
    "/contribuables",
    "/contribuables/:path*",
    "/echantillons",
    "/echantillons/:path*",
    "/tirages",
    "/tirages/:path*",
    "/declarants",
    "/declarants/:path*",
    "/indicateurs",
    "/indicateurs/:path*",
    "/corrections",
    "/corrections/:path*",
    "/reexamens",
    "/reexamens/:path*",
    "/messages",
    "/messages/:path*",
    "/regles",
    "/regles/:path*",
    "/connexion",
  ],
};
