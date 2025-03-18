import nodemailer from "nodemailer";
import mustache from "mustache";
import { EmailData } from "../types/types";
import fs from "fs";
import "dotenv/config";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// 1. Verify Email In Register
const verificationEmailTemplate = fs.readFileSync(
  path.join(__dirname, "templates", "verify-email.html"),
  "utf-8"
);

export const sendVerificationEmail = async (
  user: { name: string; email: string; id: string },
  token: string
): Promise<void> => {
  try {
    const verificationLink = `${process.env.CLIENT_URL}/activate-account?token=${token}`;

    const htmlContent = mustache.render(verificationEmailTemplate, {
      name: user.name,
      verificationLink,
      appName: process.env.APP_NAME || "Our Application",
      currentYear: new Date().getFullYear(),
    });

    const mailOptions: EmailData = {
      from: process.env.SMTP_MAIL || "",
      to: user.email,
      subject: "Verify Your Email Address",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// 2. Verify Email in Update Profile
const verificationNewEmailTemplate = fs.readFileSync(
  path.join(__dirname, "templates", "verify-new-email.html"),
  "utf-8"
);

export const sendVerificationNewEmail = async (
  user: { name: string; email: string; id: string },
  token: string,
  email: string
): Promise<void> => {
  try {
    const verificationLink = `${process.env.CLIENT_URL}/verify-new-email?token=${token}`;

    const htmlContent = mustache.render(verificationNewEmailTemplate, {
      name: user.name,
      verificationLink,
      appName: process.env.APP_NAME || "Our Application",
      currentYear: new Date().getFullYear(),
    });

    const mailOptions: EmailData = {
      from: process.env.SMTP_MAIL || "",
      to: email,
      subject: "Verify Your New Email Address",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// 3. Change Password Verify
const verificationChangePasswordEmailTemplate = fs.readFileSync(
  path.join(__dirname, "templates", "verify-new-password.html"),
  "utf-8"
);

export const sendVerificationChangePasswordEmail = async (
  user: { name: string; email: string; id: string },
  token: string
): Promise<void> => {
  try {
    const verificationLink = `${process.env.CLIENT_URL}/verify-new-password?token=${token}`;

    const htmlContent = mustache.render(
      verificationChangePasswordEmailTemplate,
      {
        name: user.name,
        verificationLink,
        appName: process.env.APP_NAME || "Our Application",
        currentYear: new Date().getFullYear(),
      }
    );

    const mailOptions: EmailData = {
      from: process.env.SMTP_MAIL || "",
      to: user.email,
      subject: "Verify Your New Password",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// 4. Reset Password Verify
const verificationResetPasswordEmailTemplate = fs.readFileSync(
  path.join(__dirname, "templates", "verify-reset-password.html"),
  "utf-8"
);

export const sendVerificationResetPasswordEmail = async (
  user: { name: string; email: string; id: string },
  token: string
): Promise<void> => {
  try {
    const verificationLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const htmlContent = mustache.render(
      verificationResetPasswordEmailTemplate,
      {
        name: user.name,
        verificationLink,
        appName: process.env.APP_NAME || "Our Application",
        currentYear: new Date().getFullYear(),
      }
    );

    const mailOptions: EmailData = {
      from: process.env.SMTP_MAIL || "",
      to: user.email,
      subject: "Verify Your Reset Password Request",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
