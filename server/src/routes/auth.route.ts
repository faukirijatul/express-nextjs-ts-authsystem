import { Router } from "express";
import {
  register,
  resendToken,
  verifyEmail,
  login,
  googleLogin,
  loggedInUser,
  logout,
  deleteAccount,
} from "../controllers/auth.controller";
import { validateRequest } from "../utils/validator";
import {
  loginSchema,
  googleLoginSchema,
  registerSchema,
  resendTokenSchema,
  verifyEmailSchema,
} from "../validations/auth.validation";
import { authenticateUser } from "../middlewares/auth.middleware";

const authRoutes: Router = Router();

authRoutes.post("/register", validateRequest(registerSchema), register);
authRoutes.post(
  "/resend-token",
  validateRequest(resendTokenSchema),
  resendToken
);
authRoutes.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  verifyEmail
);
authRoutes.post("/login", validateRequest(loginSchema), login);
authRoutes.post(
  "/google-login",
  validateRequest(googleLoginSchema),
  googleLogin
);
authRoutes.get("/me", authenticateUser, loggedInUser);
authRoutes.delete("/logout", authenticateUser, logout);
authRoutes.delete("/delete-account", authenticateUser, deleteAccount);

export default authRoutes;
