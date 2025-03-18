import { deleteImage, uploadImage } from "../../config/cloudinary";
import prismaClient from "../../config/prisma-client";
import { sendVerificationNewEmail } from "../../email/email-service";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "../../utils/error-handler";
import jwt, { JwtPayload } from "jsonwebtoken";

export const updateProfileService = async (
  userId: string,
  name?: string,
  email?: string,
  currentEmail?: string,
  file?: Express.Multer.File
) => {
  let updatedUser;
  let imageData;

  if (file) {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { image: true },
    });

    if (user?.image?.id) {
      if (user.image?.public_id) {
        await deleteImage(user.image.public_id, user.image.id);
      } else {
        await prismaClient.image.delete({
          where: { id: user.image.id },
        });
      }
    }

    const result = await uploadImage(file, "/images/profile");

    imageData = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: {
        name: name,
        image: {
          create: {
            url: imageData?.url || "",
            public_id: imageData?.public_id,
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

  if (name) {
    updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: { name },
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

  if (email && email !== currentEmail) {
    const isEmailExist = await prismaClient.user.findUnique({
      where: { email },
    });

    if (isEmailExist) {
      throw new ConflictError("Email already exists");
    }

    const newEmailToken = jwt.sign(
      { userId, newEmail: email } as JwtPayload,
      process.env.NEW_EMAIL_TOKEN_SECRET || "",
      { expiresIn: "1d" }
    );

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
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
      throw new NotFoundError("User not found");
    }

    await sendVerificationNewEmail(user, newEmailToken, email);

    return {
      emailChangeRequested: true,
      message: "Complete your email change, check your email inbox",
      user: { ...user, password: null },
    };
  }

  return { user: { ...updatedUser, password: null } };
};

// 2. Verify New Email Service
export const verifyNewEmailService = async (token: string) => {
  const payload = jwt.verify(
    token as string,
    process.env.NEW_EMAIL_TOKEN_SECRET || ""
  ) as JwtPayload;

  const user = await prismaClient.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      email: payload.newEmail,
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

  return { user: { ...updatedUser, password: null } };
};
