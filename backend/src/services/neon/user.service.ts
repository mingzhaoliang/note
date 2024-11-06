import { hashPassword } from "@/lib/auth/utils.js";
import { prisma } from "@/lib/db/prisma.js";
import { Prisma } from "@prisma/client";

export async function createUser({
  userData,
  accountData,
}: {
  userData: {
    fullName: string;
    username: string;
    email: string;
    password?: string;
  };
  accountData?: {
    providerId: string;
    providerUserId: string;
  };
}): Promise<string> {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: userData.email }, { username: userData.username }] },
  });

  // Hash the password
  const passwordHash = userData.password ? await hashPassword(userData.password) : undefined;

  // Check if the user already exists
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      passwordHash: passwordHash ?? Prisma.skip,
      profile: {
        create: { name: userData.fullName },
      },
      ...(accountData ? { account: { create: { ...accountData } } } : {}),
    },
  });

  return user.id;
}

export async function updatePassword(userId: string, password: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user;
}

export async function getUserByEmailOrUsername(identifier: string) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  return user;
}

export async function getAccount({
  providerId,
  providerUserId,
}: {
  providerId: string;
  providerUserId: string;
}) {
  try {
    const account = await prisma.account.findUnique({
      where: { providerId_providerUserId: { providerId, providerUserId } },
    });

    return account;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the account.");
  }
}

export async function setUserAsEmailVerifiedIfEmailMatches(
  id: string,
  email: string
): Promise<User | null> {
  const user = await prisma.user.update({
    where: { id, email },
    data: { emailVerified: true },
  });
  return user;
}

export async function deactivateUser(id: string, isDelete?: boolean) {
  const deactivatedAt = new Date();
  // Set the user to be deleted in 30 days if delete is true
  const toBeDeletedAt = isDelete ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) : Prisma.skip;

  const user = await prisma.user.update({
    where: { id },
    data: {
      deactivated: true,
      deactivatedAt,
      toBeDeletedAt,
      profile: { update: { deactivated: true, deactivatedAt, toBeDeletedAt } },
    },
  });

  return user;
}

export async function reactivateUser(id: string) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      deactivated: false,
      deactivatedAt: null,
      toBeDeletedAt: null,
      profile: { update: { deactivated: false, deactivatedAt: null, toBeDeletedAt: null } },
    },
  });

  return user;
}

export async function removeDeletedUsers() {
  await prisma.user.deleteMany({
    where: { toBeDeletedAt: { lt: new Date() } },
  });
}

export interface User {
  id: string;
  email: string;
  username: string;
  deactivated: boolean;
  deactivatedAt: Date | null;
  toBeDeletedAt: Date | null;
  emailVerified: boolean;
}
