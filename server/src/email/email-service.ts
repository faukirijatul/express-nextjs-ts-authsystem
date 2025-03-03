import nodemailer from "nodemailer";
import mustache from "mustache";
import { EmailData } from "../types/types";
import fs from "fs";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const verificationEmailTemplate = fs.readFileSync(
  "./src/email/templates/verify-email.html",
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
      from: "no-reply@example.com",
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

// const renderTemplate = (templateContent: string, data: any): string => {
//   return mustache.render(templateContent, data);
// };

// export const sendEmail = async (options: EmailData): Promise<void> => {
//   try {
//     const transporter = createTransporter();
//     await transporter.sendMail({
//       from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
//       to: options.to,
//       subject: options.subject,
//       html: options.html,
//     });
//     console.log("Email sent successfully");
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send email");
//   }
// };

// export const sendVerificationEmail = async (
//   user: { name: string; email: string; id: string },
//   token: string
// ): Promise<void> => {
//   const verificationLink = `${process.env.FRONTEND_URL}/activate-account?token=${token}`;

//   const htmlContent = renderTemplate(verificationEmailTemplate, {
//     name: user.name,
//     verificationLink,
//     appName: process.env.APP_NAME || "Our Application",
//     currentYear: new Date().getFullYear(),
//   });

//   const mailOptions: EmailData = {
//     to: user.email,
//     subject: "Verify Your Email Address",
//     html: htmlContent,
//   };

//   await sendEmail(mailOptions);
// };
