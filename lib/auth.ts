import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

// Helper to verify token and get authenticated user's public key
export function verifyToken(token: string): { publicKey: string; exp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());

    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Convert wallet address to a numeric ID (for compatibility with existing FID-based DB)
// This creates a consistent numeric ID from the wallet address
export function walletToUserId(walletAddress: string): number {
  const hash = createHash('sha256').update(walletAddress).digest();
  // Convert first 8 bytes to a number (safe integer range)
  const num = hash.readBigUInt64BE(0);
  // Keep it within JavaScript's safe integer range
  return Number(num % BigInt(Number.MAX_SAFE_INTEGER));
}

// Get authenticated user's wallet address from JWT token
export async function getAuthenticatedWallet(request: NextRequest): Promise<string | null> {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    return payload.publicKey;
  } catch (e) {
    console.error('Auth failed:', e);
    return null;
  }
}

// Get authenticated user ID (numeric, for DB compatibility)
// Returns both the wallet address and the derived user ID
export async function getAuthenticatedUser(request: NextRequest): Promise<{ wallet: string; userId: number } | null> {
  const wallet = await getAuthenticatedWallet(request);
  if (!wallet) {
    return null;
  }

  return {
    wallet,
    userId: walletToUserId(wallet)
  };
}
