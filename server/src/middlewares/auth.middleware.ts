import { NextFunction, Request, Response } from "express";
import { asyncHandler, AuthenticationError } from "../utils/error-handler";
import jwt, { JwtPayload } from "jsonwebtoken";
import prismaClient from "../config/prisma-client";
import { setCookie } from "../services/cookie.service";

export const authenticateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      throw new AuthenticationError("Unauthorized");
    }

    // First try with access token if available
    if (accessToken) {
      try {
        const payload = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET || ""
        ) as JwtPayload;

        const user = await prismaClient.user.findUnique({
          where: {
            id: payload.userId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: {
              select: {
                id: true,
                url: true,
                public_id: true,
              },
            },
            is_active: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          throw new AuthenticationError("User not found");
        }

        req.user = user;
        return next();
      } catch (error) {
        console.error("Error verifying access token:", error);
      }
    }

    if (refreshToken) {
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET || ""
        ) as JwtPayload;

        const user = await prismaClient.user.findUnique({
          where: {
            id: payload.userId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: {
              select: {
                id: true,
                url: true,
                public_id: true,
              },
            },
            is_active: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          throw new AuthenticationError("User not found");
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { userId: user.id } as JwtPayload,
          process.env.ACCESS_TOKEN_SECRET || "",
          { expiresIn: "5m" }
        );

        // Generate new refresh token (token rotation for security)
        const newRefreshToken = jwt.sign(
          { userId: user.id } as JwtPayload,
          process.env.REFRESH_TOKEN_SECRET || "",
          { expiresIn: "30d" }
        );

        setCookie(res, newAccessToken, newRefreshToken);

        req.user = user;
        return next();
      } catch (error) {
        console.error("Error verifying refresh token:", error);
        throw new AuthenticationError(
          "Authentication failed. Please login again"
        );
      }
    }

    throw new AuthenticationError("Authentication failed");
  }
);
