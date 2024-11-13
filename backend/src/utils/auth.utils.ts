import { hash, verify } from "@node-rs/argon2";
import { encodeBase32UpperCaseNoPadding } from "@oslojs/encoding";

export function generateRandomOTP(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const code = encodeBase32UpperCaseNoPadding(bytes);
  return code;
}

const options = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
  const passwordHash = await hash(password, options);
  return passwordHash;
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  const verified = await verify(passwordHash, password, options);
  return verified;
}
