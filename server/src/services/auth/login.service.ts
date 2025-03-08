import { prismaClient } from "../../config/prisma-client";
import { AuthenticationError } from "../../utils/error-handler";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { setCookie } from "../cookie.service";
import { Response } from "express";

// 1. Login
export const loginService = async (
  res: Response,
  email: string,
  password: string
) => {
  const user = await prismaClient.user.findUnique({
    where: {
      email: email,
    },
    include: {
      image: {
        select: {
          id: true,
          url: true,
          public_id: true,
        },
      },
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

  return { user: { ...user, password: null } };
};

// Google Login Service
export const googleLoginService = async (
  res: Response,
  name: string,
  email: string,
  picture: string
) => {
  const user = await prismaClient.user.findUnique({
    where: {
      email: email,
    },
    include: {
      image: true,
    },
  });

  if (user) {
    if (user.image && user.image.url !== picture && !user.image.public_id) {
      user.image.url = picture;
      await prismaClient.user.update({
        where: {
          id: user.id,
        },
        data: {
          image: {
            update: {
              url: picture,
            },
          },
        },
        include: {
          image: {
            select: {
              id: true,
              url: true,
              public_id: true,
            },
          },
        },
      });
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

    return user;
  }

  const newUser = await prismaClient.user.create({
    data: {
      name: name,
      email: email,
      is_active: true,
      image: {
        create: {
          url: picture,
        },
      },
    },
    include: {
      image: {
        select: {
          id: true,
          url: true,
          public_id: true,
        },
      },
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

  return newUser;
};
