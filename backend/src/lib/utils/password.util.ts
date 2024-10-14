import { hash, verify } from "@node-rs/argon2";

const options = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

const hashPassword = async (password: string): Promise<string> => {
  const passwordHash = await hash(password, options);
  return passwordHash;
};

const verifyPassword = async (passwordHash: string, password: string): Promise<boolean> => {
  const verified = await verify(passwordHash, password, options);
  return verified;
};

export { hashPassword, verifyPassword };
