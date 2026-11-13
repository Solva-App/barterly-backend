import { SignJWT, jwtVerify } from "jose";

const JWT_ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
}

// Generate short-lived Access Token
export const generateAccessToken = async (payload: TokenPayload): Promise<string> => {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES_IN)
    .sign(JWT_ACCESS_SECRET);
};

// Generate long-lived Refresh Token (only needs user ID)
export const generateRefreshToken = async (id: string): Promise<string> => {
  return await new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES_IN)
    .sign(JWT_REFRESH_SECRET);
};

// Helper to generate both at once during login/signup
export const generateTokens = async (payload: TokenPayload) => {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload.id),
  ]);

  return { accessToken, refreshToken };
};

// Verify Access Token
export const verifyAccessToken = async (token: string): Promise<TokenPayload> => {
  const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
  });
  return payload as unknown as TokenPayload;
};

// Verify Refresh Token
export const verifyRefreshToken = async (token: string): Promise<{ id: string }> => {
  const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
    algorithms: ["HS256"],
  });
  return payload as unknown as { id: string };
};
