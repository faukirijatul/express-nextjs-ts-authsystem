import { Request } from "express";
import { AuthenticationError } from "../../utils/error-handler";
import { prismaClient } from "../../config/prisma-client";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  sendVerificationChangePasswordEmail,
  sendVerificationResetPasswordEmail,
} from "../../email/email-service";

// 1. Update Password Service
export const updatePasswordService = async (
  req: Request,
  password: string,
  newPassword: string
) => {
  const reqUser = req.user;
  if (!reqUser) {
    throw new AuthenticationError("Unauthorized");
  }

  const user = await prismaClient.user.findUnique({
    where: {
      id: reqUser.id,
    },
  });

  const isMatch = await bcrypt.compare(password, user?.password || "");

  if (!isMatch) {
    throw new AuthenticationError("Unauthorized");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatePasswordToken = jwt.sign(
    { userId: reqUser.id, newPassword: hashedPassword } as JwtPayload,
    process.env.UPDATE_PASSWORD_TOKEN_SECRET || "",
    { expiresIn: "1d" }
  );

  await sendVerificationChangePasswordEmail(reqUser, updatePasswordToken);
};

// 2. Verify New Password Service
export const verifyNewPasswordService = async (token: string) => {
  const payload = jwt.verify(
    token as string,
    process.env.UPDATE_PASSWORD_TOKEN_SECRET || ""
  ) as JwtPayload;

  const user = await prismaClient.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: payload.newPassword,
    },
  });
};

// 3. Forgot Password Service
export const forgotPasswordService = async (email: string) => {
  const user = await prismaClient.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const forgotPasswordToken = jwt.sign(
    { userId: user.id } as JwtPayload,
    process.env.FORGOT_PASSWORD_TOKEN_SECRET || "",
    { expiresIn: "1d" }
  );

  await sendVerificationResetPasswordEmail(user, forgotPasswordToken);
};

// 4. Reset Password Verify Service
export const resetPasswordVerifyService = async (
  token: string,
  newPassword: string
) => {
  const payload = jwt.verify(
    token as string,
    process.env.FORGOT_PASSWORD_TOKEN_SECRET || ""
  ) as JwtPayload;

  const user = await prismaClient.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });
};
