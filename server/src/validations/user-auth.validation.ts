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

export const deleteAccountSchema = {
  params: z.object({
    id: commonValidations.id.optional(),
  }),
};
