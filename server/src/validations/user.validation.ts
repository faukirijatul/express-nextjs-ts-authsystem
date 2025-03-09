import { z } from "zod";
import { commonValidations } from "./validator";

export const registerSchema = {
  body: z.object({
    name: commonValidations.name,
    email: commonValidations.email,
    password: commonValidations.password,
  }),
};

export const resendTokenSchema = {
  body: z.object({
    email: commonValidations.email,
  }),
};

export const verifyEmailSchema = {
  body: z.object({
    token: z.string().min(1, "Token is required"),
  }),
};

export const loginSchema = {
  body: z.object({
    email: commonValidations.email,
    password: z.string().min(1, "Password is required"),
  }),
};

export const googleLoginSchema = {
  body: z.object({
    email: commonValidations.email,
    name: commonValidations.name,
    picture: commonValidations.picture,
  }),
};

export const updateProfileSchema = {
  body: z.object({
    email: commonValidations.email.optional(),
    name: commonValidations.name.optional(),
  }),
  file: z
    .custom((file) => {
      if (!file) return true;

      if (!file.mimeType.startsWith("/image")) {
        throw new Error("File must be an image");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5mb");
      }

      return true;
    })
    .optional(),
};

export const verifyNewEmailSchema = {
  body: z.object({
    token: z.string().min(1, "Token is required"),
  }),
};

export const updatePasswordSchema = {
  body: z.object({
    password: commonValidations.password,
    newPassword: commonValidations.password,
  }),
};

export const verifyNewPasswordSchema = {
  body: z.object({
    token: z.string().min(1, "Token is required"),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: commonValidations.email,
  }),
};

export const resetPasswordVerifySchema = {
  body: z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: commonValidations.password,
  }),
};

export const deleteAccountSchema = {
  params: z.object({
    id: commonValidations.id.optional(),
  }),
};
