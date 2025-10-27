import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import * as nacl from "tweetnacl";

// Helper to generate a simple JWT-like token
function generateToken(publicKey: string): string {
  const payload = {
    publicKey,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  };

  // For now, just base64 encode the payload
  // In production, you'd want to sign this with a secret
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Helper to verify token
function verifyToken(token: string): { publicKey: string; exp: number } | null {
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

// POST - Sign in with wallet signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey, signature, message } = body;

    if (!publicKey || !signature || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the signature
    try {
      const publicKeyObj = new PublicKey(publicKey);
      const signatureBytes = bs58.decode(signature);
      const messageBytes = new TextEncoder().encode(message);

      const verified = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyObj.toBytes()
      );

      if (!verified) {
        return NextResponse.json(
          { success: false, message: "Invalid signature" },
          { status: 401 }
        );
      }

      // Generate auth token
      const token = generateToken(publicKey);
      const now = Math.floor(Date.now() / 1000);

      return NextResponse.json({
        success: true,
        token,
        user: {
          publicKey,
          issuedAt: now,
          expiresAt: now + (7 * 24 * 60 * 60),
        },
      });

    } catch (err) {
      console.error("Signature verification failed:", err);
      return NextResponse.json(
        { success: false, message: "Signature verification failed" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Verify existing token
export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  const token = authorization.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      publicKey: payload.publicKey,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: payload.exp,
    },
  });
}