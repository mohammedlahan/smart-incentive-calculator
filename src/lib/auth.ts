import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'smart_incentive_calculator_jwt_secret_key_2026_vehicle_dealership'
);

export interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES_OFFICER';
}

/**
 * Sign a user session payload into a JWT
 */
export async function signJWT(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Session valid for 24 hours
    .sign(JWT_SECRET);
}

/**
 * Verify a session JWT and return its payload, or null if invalid/expired
 */
export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as 'ADMIN' | 'SALES_OFFICER',
    };
  } catch (error) {
    return null;
  }
}
