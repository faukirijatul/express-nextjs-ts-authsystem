import { Request, Response } from "express";
import { prismaClient } from "../config/prisma-client";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendVerificationEmail } from "../email/email-service";
import {
  asyncHandler,
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "../utils/error-handler";
import { clearCookie, setCookie } from "../services/cookie.service";

export const register = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { name, email, password } = req.body;

    const isEmailExist = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (isEmailExist) {
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        name: name,
        email: email,
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

    return res
      .status(201)
      .json({ success: true, message: "User registered and email sent", user });
  }
);

export const resendToken = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    const user = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
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

    user.password = null;

    return res.status(200).json({ success: true, message: "Email sent", user });
  }
);

export const verifyEmail = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { token } = req.body;

    const payload = jwt.verify(
      token as string,
      process.env.REGISTER_TOKEN_SECRET || ""
    ) as JwtPayload;

    const user = await prismaClient.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const verifiedUser = await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        is_active: true,
      },
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

    return res
      .status(200)
      .json({ success: true, message: "Email verified", user: verifiedUser });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    const user = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new AuthenticationError("Username or password incorrect");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");

    if (!isPasswordValid) {
      throw new AuthenticationError("Username or password incorrect");
    }

    const accessToken = jwt.sign(
      { userId: user.id } as JwtPayload,
      process.env.ACCESS_TOKEN_SECRET || "",
      { expiresIn: "5m" }
    );
    const refreshToken = jwt.sign(
      { userId: user.id } as JwtPayload,
      process.env.REFRESH_TOKEN_SECRET || "",
      { expiresIn: "30d" }
    );

    setCookie(res, accessToken, refreshToken);

    user.password = null;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  }
);

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const user = await prismaClient.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    const accessToken = jwt.sign(
      { userId: user.id } as JwtPayload,
      process.env.ACCESS_TOKEN_SECRET || "",
      { expiresIn: "5m" }
    );
    const refreshToken = jwt.sign(
      { userId: user.id } as JwtPayload,
      process.env.REFRESH_TOKEN_SECRET || "",
      { expiresIn: "30d" }
    );

    setCookie(res, accessToken, refreshToken);

    return res
      .status(200)
      .json({ success: true, message: "Login successful", user });
  }

  const newUser = await prismaClient.user.create({
    data: {
      name: name,
      email: email,
      is_active: true,
    },
  });

  const accessToken = jwt.sign(
    { userId: newUser.id } as JwtPayload,
    process.env.ACCESS_TOKEN_SECRET || "",
    { expiresIn: "5m" }
  );
  const refreshToken = jwt.sign(
    { userId: newUser.id } as JwtPayload,
    process.env.REFRESH_TOKEN_SECRET || "",
    { expiresIn: "30d" }
  );

  setCookie(res, accessToken, refreshToken);

  return res
    .status(200)
    .json({ success: true, message: "Login successful", user: newUser });
});

export const loggedInUser = asyncHandler((req: Request, res: Response): any => {
  const user = req.user;

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  return res
    .status(200)
    .json({ success: true, message: "User logged in", user });
});

export const logout = asyncHandler((req: Request, res: Response): any => {
  clearCookie(res);

  return res.status(200).json({ success: true, message: "Logout successful" });
});

export const deleteAccount = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.user;

  await prismaClient.user.delete({
    where: {
      id,
    },
  });

  clearCookie(res);

  return res.status(200).json({ success: true, message: "Account deleted" });
});
