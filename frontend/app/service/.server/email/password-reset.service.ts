import envConfig from "@/config/env.config.server";
import { sendEmail } from "./send-email.service";

const sendPasswordResetEmail = async (email: string, verificationCode: string) => {
  if (envConfig.NODE_ENV !== "production") {
    console.log(verificationCode);
    return;
  }

  await sendEmail(email, "Password Reset", template(verificationCode));
};

const template = (verificationCode: string) => {
  return `
    <h1>Password Reset</h1>
    <p>Please use the following code to reset your password:</p>
    <p>${verificationCode}</p>
    <p>Thank you!</p>
  `;
};

export { sendPasswordResetEmail };
