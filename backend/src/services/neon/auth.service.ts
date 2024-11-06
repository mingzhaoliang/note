import { prisma } from "@/lib/db/prisma.js";
import { hashPassword } from "@/lib/utils/password.util.js";
import { Prisma } from "@prisma/client";
import { generateIdFromEntropySize } from "lucia";
import { createDate, TimeSpan } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";

interface CreateUserArgs {
  user: {
    fullName: string;
    username: string;
    email: string;
    password?: string;
  };
  account?: {
    providerId: string;
    providerUserId: string;
  };
}

const createUser = async ({ user, account }: CreateUserArgs): Promise<string> => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: user.email }, { username: user.username }] },
    });

    // Hash the password
    const passwordHash = user.password ? await hashPassword(user.password) : undefined;

    // Check if the user already exists
    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const userId = generateIdFromEntropySize(10);

    await prisma.user.create({
      data: {
        id: userId,
        email: user.email,
        username: user.username,
        passwordHash: passwordHash ?? Prisma.skip,
        profile: {
          create: { name: user.fullName },
        },
        ...(account ? { account: { create: { ...account } } } : {}),
      },
    });

    return userId;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create an account.");
  }
};

const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the user.");
  }
};

const getUserByEmailOrUsername = async (identifier: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the user.");
  }
};

type FindAccountArgs = { providerId: string; providerUserId: string };

const findAccount = async ({ providerId, providerUserId }: FindAccountArgs) => {
  try {
    const account = await prisma.account.findUnique({
      where: { providerId_providerUserId: { providerId, providerUserId } },
    });

    return account;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the account.");
  }
};

const createPasswordResetToken = async (userId: string): Promise<string> => {
  try {
    // Invalidate all existing tokens
    await prisma.passwordReset.deleteMany({ where: { userId } });
    const tokenId = generateIdFromEntropySize(25);
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));

    await prisma.passwordReset.create({
      data: {
        tokenHash,
        userId,
        expiresAt: createDate(new TimeSpan(2, "h")),
      },
    });

    return tokenId;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create a password reset token.");
  }
};

const findPasswordResetToken = async (tokenHash: string) => {
  try {
    const storedToken = await prisma.passwordReset.findUnique({ where: { tokenHash } });
    return storedToken;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to find a password reset token.");
  }
};

const deletePasswordResetToken = async (tokenHash: string) => {
  try {
    await prisma.passwordReset.delete({ where: { tokenHash } });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete a password reset token.");
  }
};

const updatePassword = async (userId: string, password: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(password) },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update the password.");
  }
};

const deactivateUser = async (id: string, isDelete?: boolean) => {
  try {
    const deactivatedAt = new Date();
    // Set the user to be deleted in 30 days if delete is true
    const toBeDeletedAt = isDelete ? createDate(new TimeSpan(30, "d")) : Prisma.skip;

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
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete the user.");
  }
};

const reactivateUser = async (id: string) => {
  try {
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
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete the user.");
  }
};

const removeDeletedUsers = async () => {
  try {
    await prisma.user.deleteMany({
      where: { toBeDeletedAt: { lt: new Date() } },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete the user.");
  }
};

export {
  createPasswordResetToken,
  createUser,
  deactivateUser,
  deletePasswordResetToken,
  findAccount,
  findPasswordResetToken,
  getUserByEmailOrUsername,
  getUserById,
  reactivateUser,
  removeDeletedUsers,
  updatePassword,
};
