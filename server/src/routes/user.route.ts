import { Router } from "express";
import * as userAuthController from "../controllers/user.controller";
import { validateRequest } from "../validations/validator";
import * as validation from "../validations/user.validation";
import { authenticateUser } from "../middlewares/auth.middleware";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

const route: Router = Router();

// 1
route.post(
  "/register",
  validateRequest(validation.registerSchema),
  userAuthController.register
);

// 2
route.post(
  "/resend-token",
  validateRequest(validation.resendTokenSchema),
  userAuthController.resendToken
);

// 3
route.post(
  "/verify-email",
  validateRequest(validation.verifyEmailSchema),
  userAuthController.verifyEmail
);

// 4
route.post(
  "/login",
  validateRequest(validation.loginSchema),
  userAuthController.login
);

// 5
route.post(
  "/google-login",
  validateRequest(validation.googleLoginSchema),
  userAuthController.googleLogin
);

// 6
route.get("/me", authenticateUser, userAuthController.loggedInUser);

// 7
route.patch(
  "/update-user",
  authenticateUser,
  validateRequest(validation.updateProfileSchema),
  upload.single("image"),
  userAuthController.updateUser
);

// 8
route.post(
  "/verify-new-email",
  validateRequest(validation.verifyNewEmailSchema),
  userAuthController.verifyNewEmail
);

// 9
route.post(
  "/update-password",
  authenticateUser,
  validateRequest(validation.updatePasswordSchema),
  userAuthController.updatePassword
);

// 10
route.post(
  "/verify-new-password",
  validateRequest(validation.verifyNewPasswordSchema),
  userAuthController.verifyNewPassword
);

// 11
route.post(
  "/forgot-password",
  validateRequest(validation.forgotPasswordSchema),
  userAuthController.forgotPassword
);

// 12
route.post(
  "/reset-password-verify",
  validateRequest(validation.resetPasswordVerifySchema),
  userAuthController.resetPasswordVerify
);

// 13
route.delete("/logout", authenticateUser, userAuthController.logout);

// 14
route.delete(
  "/delete-account",
  authenticateUser,
  userAuthController.deleteAccount
);

export default route;
