import prismaClient from "../../config/prisma-client";
import { sendVerificationEmail } from "../../email/email-service";
import { ConflictError, NotFoundError } from "../../utils/error-handler";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

// 1. Register Service
export const registerService = async (
  name: string,
  email: string,
  password: string
) => {
  const isEmailExist = await prismaClient.user.findUnique({
    where: { email },
  });

  if (isEmailExist) {
    throw new ConflictError("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
    },
  });

  const registerToken = jwt.sign(
    { userId: user.id } as JwtPayload,
    process.env.REGISTER_TOKEN_SECRET || "",
    { expiresIn: "1d" }
  );

  await sendVerificationEmail(user, registerToken);

  return { user };
};

// 2. Resend Register Token
export const resendVerificationTokenService = async (email: string) => {
  const user = await prismaClient.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const registerToken = jwt.sign(
    { userId: user.id } as JwtPayload,
    process.env.REGISTER_TOKEN_SECRET || "",
    { expiresIn: "1d" }
  );

  await sendVerificationEmail(user, registerToken);

  return { user: { ...user, password: null } };
};

// 3. Verify email service
export const verifyUserEmailService = async (token: string) => {
  const payload = jwt.verify(
    token,
    process.env.REGISTER_TOKEN_SECRET || ""
  ) as JwtPayload;

  const user = await prismaClient.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const verifiedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: { is_active: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { user: verifiedUser };
};
