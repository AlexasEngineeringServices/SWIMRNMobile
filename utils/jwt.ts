import * as jose from "jose";

const JWT_SECRET = "super-jwt-secret-key";

export async function verifyJWT(token: string) {
  try {
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const { payload } = await jose.jwtVerify(token, secretKey);
    return { payload, error: null };
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return { payload: null, error: "Token has expired" };
    }
    console.error("JWT verification error:", error);
    return { payload: null, error: `Invalid token: ${error.message || "Unknown error"}` };
  }
}
