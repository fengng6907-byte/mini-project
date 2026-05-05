import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "gold-eyes-dev-secret-change-in-prod";

export interface AuthPayload {
  userId: string;
  email: string;
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}
