import { hashPassword } from "@/lib/utils/password.util.js";
import { Account, AccountDoc } from "@/models/account.model.js";
import { PasswordReset } from "@/models/password-reset.model.js";
import { Profile, ProfileDoc } from "@/models/profile.model.js";
import { User, UserDoc } from "@/models/user.model.js";
import { generateIdFromEntropySize } from "lucia";
import { FilterQuery, startSession } from "mongoose";
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
    const session = await startSession();
    session.startTransaction();

    try {
      const existingUser = await findUser({
        $or: [{ email: user.email }, { username: user.username }],
      });

      // Hash the password
      const passwordHash = user.password ? await hashPassword(user.password) : undefined;

      // Check if the user already exists
      if (existingUser) {
        throw new Error("An account with this email already exists.");
      }

      const userId = generateIdFromEntropySize(10);

      const userData: Partial<UserDoc> = {
        _id: userId,
        username: user.username,
        email: user.email,
        passwordHash,
      };

      const profileData: Partial<ProfileDoc> = {
        userId,
        name: user.fullName,
      };

      await User.create([userData], { session });
      await Profile.create([profileData], { session });

      if (account) {
        await Account.create([{ _id: account, userId }], { session });
      }

      await session.commitTransaction();

      return userId;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create an account.");
  }
};

const findUser = async (filter: FilterQuery<UserDoc> = {}): Promise<UserDoc | null> => {
  try {
    const user = await User.findOne(filter);

    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the user.");
  }
};

const findAccount = async (accountId: {
  providerId: string;
  providerUserId: string;
}): Promise<AccountDoc | null> => {
  try {
    const account = await Account.findOne({ _id: accountId });

    return account;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the account.");
  }
};

const createPasswordResetToken = async (userId: string): Promise<string> => {
  try {
    // Invalidate all existing tokens
    await PasswordReset.deleteMany({ userId });
    const tokenId = generateIdFromEntropySize(25);
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));

    await PasswordReset.create({ tokenHash, userId, expiresAt: createDate(new TimeSpan(2, "h")) });

    return tokenId;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create a password reset token.");
  }
};

const updatePassword = async (userId: string, password: string): Promise<void> => {
  try {
    await User.updateOne({ _id: userId }, { $set: { passwordHash: await hashPassword(password) } });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update the password.");
  }
};

export { createPasswordResetToken, createUser, findAccount, findUser, updatePassword };
