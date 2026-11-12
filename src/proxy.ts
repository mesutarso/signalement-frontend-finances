import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/compte", "/comptes", "/signalements", "/imports", "/indices", "/journal", "/supervision", "/dossiers", "/courriers", "/recompenses", "/etats", "/contribuables", "/echantillons", "/tirages", "/declarants", "/indicateurs", "/corrections", "/reexamens", "/messages", "/regles"];

function protectedPath(pathname: string): boolean {
  return PROTECTED.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

async function accountRole(request: NextRequest): Promise<string | null> {
  const cookie = request.headers.get("cookie") ?? "";
  if (!cookie.includes("SESSION=")) {
    return null;
  }
  try {
    const response = await fetch(new URL("/api/auth", process.env.BACKEND_URL ?? "http://localhost:8080"), {
      headers: { cookie },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const account = await response.json();
    return typeof account.role === "string" ? account.role : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = await accountRole(request);
  const signedIn = role !== null;

  if (protectedPath(pathname) && !signedIn) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }
  if (pathname === "/connexion" && signedIn) {
    return NextResponse.redirect(new URL(["CELLULE", "CABINET", "PAYMASTER"].includes(role ?? "") ? "/etats" : "/signalements", request.url));
  }
  if (role === "AGENT" && protectedPath(pathname) && pathname !== "/compte" && !pathname.startsWith("/signalements")) {
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
    "/recompenses",
    "/recompenses/:path*",
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
