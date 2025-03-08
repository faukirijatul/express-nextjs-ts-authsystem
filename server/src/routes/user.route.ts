import { Router } from "express";
import * as userAuthController from "../controllers/user.controller";
import { validateRequest } from "../validations/validator";
import {
  loginSchema,
  googleLoginSchema,
  registerSchema,
  resendTokenSchema,
  verifyEmailSchema,
} from "../validations/user-auth.validation";
import { authenticateUser } from "../middlewares/auth.middleware";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

const route: Router = Router();

route.post(
  "/register",
  validateRequest(registerSchema),
  userAuthController.register
);
route.post(
  "/resend-token",
  validateRequest(resendTokenSchema),
  userAuthController.resendToken
);
route.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  userAuthController.verifyEmail
);
route.post("/login", validateRequest(loginSchema), userAuthController.login);
route.post(
  "/google-login",
  validateRequest(googleLoginSchema),
  userAuthController.googleLogin
);
route.get("/me", authenticateUser, userAuthController.loggedInUser);
route.patch(
  "/update-user",
  authenticateUser,
  upload.single("image"),
  userAuthController.updateUser
);
route.post("/verify-new-email", userAuthController.verifyNewEmail);
route.post(
  "/update-password",
  authenticateUser,
  userAuthController.updatePassword
);
route.post("/verify-new-password", userAuthController.verifyNewPassword);
route.post("/forgot-password", userAuthController.forgotPassword);
route.post("/reset-password-verify", userAuthController.resetPasswordVerify);
route.delete("/logout", authenticateUser, userAuthController.logout);
route.delete(
  "/delete-account",
  authenticateUser,
  userAuthController.deleteAccount
);

export default route;
