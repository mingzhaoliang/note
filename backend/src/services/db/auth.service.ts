import { hashPassword } from "@/lib/utils/password.util.js";
import { Account, AccountDoc } from "@/models/account.model.js";
import { Profile, ProfileDoc } from "@/models/profile.model.js";
import { User, UserDoc } from "@/models/user.model.js";
import { generateIdFromEntropySize } from "lucia";
import { FilterQuery, startSession } from "mongoose";

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

export { createUser, findAccount, findUser };
