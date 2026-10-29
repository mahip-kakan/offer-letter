import { NextResponse, type NextRequest } from "next/server";

import { contentSecurityPolicy, createNonce } from "@/lib/csp";

/** The Claude connector's endpoint, its sign-in and the metadata that points to them. */
const CONNECTOR_PATHS = /^\/(?:api\/(?:mcp|oauth)(?:\/|$)|\.well-known\/oauth-(?:authorization-server|protected-resource)(?:\/|$))/;

/**
 * Gives every page its Content-Security-Policy (E11-5). This copy does not
 * ask for a password: pages open on the computer that runs the server.
 * The Claude connector still brings its own OAuth token, which its routes
 * check; they answer 404 while it's off.
 */
export async function proxy(request: NextRequest) {
  if (CONNECTOR_PATHS.test(request.nextUrl.pathname)) return NextResponse.next();
  return pass(request);
}

/**
 * Lets the request through. Pages get the policy on the response, and on the
 * request too: that's where Next.js finds the nonce for its scripts. API
 * answers (JSON, files) need none.
 */
function pass(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();
  // Behind a reverse proxy that ends TLS, only the forwarded header knows.
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? request.nextUrl.protocol.replace(/:$/, "");
  const policy = contentSecurityPolicy(createNonce(), { dev: process.env.NODE_ENV === "development", https: protocol === "https" });
  const headers = new Headers(request.headers);
  headers.set("content-security-policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("content-security-policy", policy);
  return response;
}

export const config = {
  matcher: [
    // Everything except the health check, Next.js' own assets (scripts,
    // styles, fonts, images), the dev server's hot-reload socket and public
    // files.
    "/((?!api/health(?:/|$)|_next/static/|_next/image|_next/hmr|favicon\\.ico$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)",
  ],
};
