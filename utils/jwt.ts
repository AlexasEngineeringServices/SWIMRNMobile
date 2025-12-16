import CryptoJS from 'crypto-js';

// Base64url encoding (URL-safe)
function base64url(input: string): string {
  return input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Base64url decoding
function base64urlDecode(input: string): string {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return input;
}

// Signs a JWT with HS256 and expiry (in seconds) - using crypto-js for React Native compatibility
export async function signJWT(payload: object, secret: string, expiresInSec: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSec;
  const fullPayload = { ...payload, exp };
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64url(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(header))));
  const payloadB64 = base64url(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(fullPayload))));
  
  const data = `${headerB64}.${payloadB64}`;
  const signature = CryptoJS.HmacSHA256(data, secret);
  const signatureB64 = base64url(CryptoJS.enc.Base64.stringify(signature));
  
  return `${data}.${signatureB64}`;
}

// Verifies a JWT and returns the payload if valid and not expired
export async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;
    
    const data = `${headerB64}.${payloadB64}`;
    const signature = CryptoJS.HmacSHA256(data, secret);
    const expectedSigB64 = base64url(CryptoJS.enc.Base64.stringify(signature));
    
    if (signatureB64 !== expectedSigB64) return null;
    
    const payloadStr = CryptoJS.enc.Base64.parse(base64urlDecode(payloadB64)).toString(CryptoJS.enc.Utf8);
    const payload = JSON.parse(payloadStr);
    
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    
    return payload;
  } catch (e) {
    return null;
  }
}
