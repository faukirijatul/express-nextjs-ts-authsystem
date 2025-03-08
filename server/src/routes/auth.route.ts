import { Router } from "express";
import * as userAuthController from "../controllers/auth.controller";
import { validateRequest } from "../utils/validator";
import {
  loginSchema,
  googleLoginSchema,
  registerSchema,
  resendTokenSchema,
  verifyEmailSchema,
} from "../validations/auth.validation";
import { authenticateUser } from "../middlewares/auth.middleware";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

const authRoutes: Router = Router();

authRoutes.post(
  "/register",
  validateRequest(registerSchema),
  userAuthController.register
);
authRoutes.post(
  "/resend-token",
  validateRequest(resendTokenSchema),
  userAuthController.resendToken
);
authRoutes.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  userAuthController.verifyEmail
);
authRoutes.post(
  "/login",
  validateRequest(loginSchema),
  userAuthController.login
);
authRoutes.post(
  "/google-login",
  validateRequest(googleLoginSchema),
  userAuthController.googleLogin
);
authRoutes.get("/me", authenticateUser, userAuthController.loggedInUser);
authRoutes.patch(
  "/update-user",
  authenticateUser,
  upload.single("image"),
  userAuthController.updateUser
);
authRoutes.post("/verify-new-email", userAuthController.verifyNewEmail);
authRoutes.post(
  "/update-password",
  authenticateUser,
  userAuthController.updatePassword
);
authRoutes.post("/verify-new-password", userAuthController.verifyNewPassword);
authRoutes.post("/forgot-password", userAuthController.forgotPassword);
authRoutes.post(
  "/reset-password-verify",
  userAuthController.resetPasswordVerify
);
authRoutes.delete("/logout", authenticateUser, userAuthController.logout);
authRoutes.delete(
  "/delete-account",
  authenticateUser,
  userAuthController.deleteAccount
);

export default authRoutes;
