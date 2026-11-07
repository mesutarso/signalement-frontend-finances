import { cookies } from "next/headers";
import { backendUrl } from "@/config/env";

type ApiError = { message?: string };

export type WriteResult<T = null> = { ok: true; body: T | null } | { ok: false; message: string };

async function cookieHeader(): Promise<string> {
  const jar = await cookies();
  return jar
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");
}

async function storeCookies(response: Response): Promise<void> {
  const jar = await cookies();
  for (const header of response.headers.getSetCookie()) {
    const [pair, ...attributes] = header.split(";").map((part) => part.trim());
    const separator = pair.indexOf("=");
    if (separator < 1) {
      continue;
    }
    const name = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    const expired = attributes.some((attribute) => attribute.toLowerCase() === "max-age=0");
    if (!value || expired) {
      jar.delete(name);
      continue;
    }
    const sameSite = attributes
      .find((attribute) => attribute.toLowerCase().startsWith("samesite="))
      ?.split("=")[1]
      ?.toLowerCase();
    jar.set(name, value, {
      httpOnly: attributes.some((attribute) => attribute.toLowerCase() === "httponly"),
      secure: attributes.some((attribute) => attribute.toLowerCase() === "secure"),
      path: "/",
      sameSite: sameSite === "strict" || sameSite === "none" ? sameSite : "lax",
    });
  }
}

async function protectionToken(): Promise<string> {
  const response = await fetch(new URL("/api/auth/csrf", backendUrl()), {
    cache: "no-store",
    headers: { cookie: await cookieHeader() },
  });
  await storeCookies(response);
  const issued = response.headers
    .getSetCookie()
    .find((header) => header.startsWith("XSRF-TOKEN="));
  if (issued) {
    return issued.split(";")[0].slice("XSRF-TOKEN=".length);
  }
  return (await cookies()).get("XSRF-TOKEN")?.value ?? "";
}

export async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(new URL(path, backendUrl()), {
    cache: "no-store",
    headers: { cookie: await cookieHeader() },
  });
  if (!response.ok) {
    throw new Error("unexpected-response");
  }
  return (await response.json()) as T;
}

export async function readOutcome<T>(path: string): Promise<{ ok: true; body: T } | { ok: false; message: string }> {
  const response = await fetch(new URL(path, backendUrl()), {
    cache: "no-store",
    headers: { cookie: await cookieHeader() },
  });
  if (response.ok) {
    return { ok: true, body: (await response.json()) as T };
  }
  const error = (await response.json().catch(() => null)) as ApiError | null;
  return { ok: false, message: error?.message ?? "Les informations saisies ne sont pas acceptées." };
}

export async function readOptionalJson<T>(path: string): Promise<T | null> {
  const response = await fetch(new URL(path, backendUrl()), {
    cache: "no-store",
    headers: { cookie: await cookieHeader() },
  });
  if (response.status === 401 || response.status === 403) {
    return null;
  }
  if (!response.ok) {
    throw new Error("unexpected-response");
  }
  return (await response.json()) as T;
}

export async function readMissingJson<T>(path: string): Promise<T | null> {
  const response = await fetch(new URL(path, backendUrl()), {
    cache: "no-store",
    headers: { cookie: await cookieHeader() },
  });
  if (response.status === 404 || response.status === 401 || response.status === 403) {
    return null;
  }
  if (!response.ok) {
    throw new Error("unexpected-response");
  }
  return (await response.json()) as T;
}

export async function readBytes(path: string): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const response = await fetch(new URL(path, backendUrl()), {
    cache: "no-store",
    headers: { cookie: await cookieHeader() },
  });
  if (!response.ok) {
    return null;
  }
  return {
    body: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") ?? "application/octet-stream",
  };
}

export async function writeJson<T = null>(path: string, method: string, body?: unknown): Promise<WriteResult<T>> {
  const token = await protectionToken();
  const headers: Record<string, string> = {
    cookie: await cookieHeader(),
    "X-XSRF-TOKEN": token,
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(new URL(path, backendUrl()), {
    method,
    cache: "no-store",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  await storeCookies(response);
  if (response.ok) {
    if (response.status === 204) {
      return { ok: true, body: null };
    }
    const text = await response.text();
    return { ok: true, body: text ? (JSON.parse(text) as T) : null };
  }
  const error = (await response.json().catch(() => null)) as ApiError | null;
  return { ok: false, message: error?.message ?? "Les informations saisies ne sont pas acceptées." };
}

export async function writeForm<T = null>(path: string, formData: FormData): Promise<WriteResult<T>> {
  const token = await protectionToken();
  const response = await fetch(new URL(path, backendUrl()), {
    method: "POST",
    cache: "no-store",
    headers: {
      cookie: await cookieHeader(),
      "X-XSRF-TOKEN": token,
    },
    body: formData,
  });
  await storeCookies(response);
  if (response.ok) {
    const text = await response.text();
    return { ok: true, body: text ? (JSON.parse(text) as T) : null };
  }
  const error = (await response.json().catch(() => null)) as ApiError | null;
  return { ok: false, message: error?.message ?? "Les informations saisies ne sont pas acceptées." };
}
