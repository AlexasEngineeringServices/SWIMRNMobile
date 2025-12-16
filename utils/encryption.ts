import { signJWT, verifyJWT } from "./jwt";

/**
 * Encryption/decryption utilities for user IDs in shareable links
 * Includes secret key validation for unauthenticated web views
 * Uses Base64 encoding with XOR cipher for obfuscation
 */

/**
 * Gets the web secret key from environment
 */
function getWebSecretKey(): string {
  return process.env.EXPO_PUBLIC_WEB_SECRET_KEY || "SwimWebSuperSecretKey12345@SwimWebSuperSecretKey67890";
}

/**
 * Encrypts a user ID as a JWT with 7-day expiry for the shareable slug
 * The slug is the JWT itself (URL-safe)
 */
export async function encryptUserId(userId: string): Promise<string> {
  try {
    if (typeof userId !== "string" || !userId) {
      throw new Error("Invalid userId: must be a non-empty string");
    }
    const webSecretKey = getWebSecretKey();
    console.log("Encrypting userId:", userId);
    console.log("Using secret key length:", webSecretKey.length);
    // 7 days expiry
    const expiresInSec = 7 * 24 * 60 * 60;
    const jwt = await signJWT({ uid: userId }, webSecretKey, expiresInSec);
    console.log("JWT generated successfully, length:", jwt.length);
    if (typeof jwt !== "string" || !jwt) {
      throw new Error("JWT generation failed");
    }
    return jwt;
  } catch (error) {
    console.error("Encryption error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return "";
  }
}

/**
 * Decrypts a slug (JWT) back to the original user ID
 * Validates expiry and signature
 */
export async function decryptUserId(encryptedSlug: string): Promise<string | null> {
  try {
    if (typeof encryptedSlug !== "string" || !encryptedSlug) {
      throw new Error("Invalid encryptedSlug: must be a non-empty string");
    }
    const webSecretKey = getWebSecretKey();
    const payload = await verifyJWT(encryptedSlug, webSecretKey);
    if (!payload || typeof payload.uid !== "string" || !payload.uid) return null;
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(payload.uid)) return null;
    return payload.uid;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}
