'use server'

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  )

  return result.total > 0 ? result.documents[0] : null;
}

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
}

const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
}

export const createAccount = async ({ fullName, email }: { fullName: string, email: string })  => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });

  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: 'data:image/jpeg;base64,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',
        accountId
      }
    )
  }

  return parseStringify({ accountId });
}