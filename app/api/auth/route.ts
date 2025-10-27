import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();

// Helper function to determine the correct domain for JWT verification
function getUrlHost(request: NextRequest): string {
  // First try to get the origin from the Origin header (most reliable for CORS requests)
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return normalizeHost(url.host);
    } catch (error) {
      console.warn("Invalid origin header:", origin, error);
    }
  }

  // Fallback to Host header
  const host = request.headers.get("host");
  if (host) {
    return normalizeHost(host);
  }

  // Final fallback to environment variables (your original logic)
  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }

  const url = new URL(urlValue);
  return normalizeHost(url.host);
}

// Normalize host by removing www subdomain to match Farcaster JWT aud claim
function normalizeHost(host: string): string {
  // Remove www. prefix if present
  if (host.startsWith('www.')) {
    return host.substring(4);
  }
  return host;
}

export async function GET(request: NextRequest) {
  // Because we're fetching this endpoint via `sdk.quickAuth.fetch`,
  // if we're in a mini app, the request will include the necessary `Authorization` header.
  const authorization = request.headers.get("Authorization");

  // Here we ensure that we have a valid token.
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    const domain = getUrlHost(request);
    const token = authorization.split(" ")[1] as string;

    // Decode JWT to inspect claims (without verification)
    let decodedPayload = null;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
        decodedPayload = JSON.parse(payload);
      }
    } catch (e) {
      console.warn('Failed to decode JWT for inspection:', e);
    }

    console.log("Auth attempt:", {
      domain,
      rawHost: request.headers.get("host"),
      normalizedDomain: domain,
      tokenPreview: token.substring(0, 20) + "...",
      decodedAud: decodedPayload?.aud,
      decodedIss: decodedPayload?.iss,
      domainsMatch: domain === decodedPayload?.aud,
    });

    // Try to verify with the normalized domain first, then with www prefix
    // This handles cases where Farcaster issues tokens with either variant
    let payload;
    try {
      payload = await client.verifyJwt({
        token,
        domain, // Try normalized version first (without www)
      });
      console.log("Auth success with normalized domain:", domain);
    } catch (e) {
      // If that fails and domain doesn't have www, try with www prefix
      if (!domain.startsWith('www.')) {
        const wwwDomain = `www.${domain}`;
        console.log("Retrying with www domain:", wwwDomain);
        payload = await client.verifyJwt({
          token,
          domain: wwwDomain,
        });
        console.log("Auth success with www domain:", wwwDomain);
      } else {
        // Re-throw if we already tried www or it's a different error
        throw e;
      }
    }

    // If the token was valid, `payload.sub` will be the user's Farcaster ID.
    const userFid = payload.sub;

    // Return user information for your waitlist application
    return NextResponse.json({
      success: true,
      user: {
        fid: userFid,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      },
    });

  } catch (e) {
    console.error("Auth verification failed:", {
      error: e,
      errorType: e instanceof Errors.InvalidTokenError ? 'InvalidTokenError' : 'Unknown',
      message: e instanceof Error ? e.message : 'Unknown error',
    });

    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({
        success: false,
        message: "Invalid token",
        error: e.message
      }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({
        success: false,
        message: e.message
      }, { status: 500 });
    }
    throw e;
  }
}