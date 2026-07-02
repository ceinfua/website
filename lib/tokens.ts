import { randomBytes } from "crypto";

/** Generates a cryptographically random URL-safe token string. */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
