import envConfig from "@/config/env.config.server";
import nodemailer from "nodemailer";

const sendEmail = async (email: string, subject: string, content: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    auth: {
      user: envConfig.NM_GMAIL_FROM,
      pass: envConfig.NM_GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.NM_GMAIL_FROM,
    to: email,
    subject,
    html: content,
  });
};

export { sendEmail };
