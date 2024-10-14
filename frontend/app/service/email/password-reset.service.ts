import envConfig from "@/config/env.config.server";
import { sendEmail } from "./send-email.service";

const sendPasswordResetToken = async (email: string, verificationLink: string) => {
  if (envConfig.NODE_ENV !== "production") {
    console.log(verificationLink);
    return;
  }

  await sendEmail(email, "Password Reset", template(verificationLink));
};

const template = (verificationLink: string) => {
  return `
    <h1>Password Reset</h1>
    <p>Click the link below to reset your password.</p>
    <a href="${verificationLink}">Reset Password</a>
  `;
};

export { sendPasswordResetToken };
