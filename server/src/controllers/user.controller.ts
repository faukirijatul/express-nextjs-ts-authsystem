import { Request, Response } from "express";
import prismaClient from "../config/prisma-client";
import { asyncHandler, AuthenticationError } from "../utils/error-handler";
import { clearCookie } from "../services/cookie.service";
import { deleteImage } from "../config/cloudinary";
import * as registrationService from "../services/auth/registration.service";
import * as loginService from "../services/auth/login.service";
import * as profileService from "../services/user/profile.service";
import * as passwordService from "../services/user/password.service";

// 1. REGISTER
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { name, email, password } = req.body;

    const { user } = await registrationService.registerService(
      name,
      email,
      password
    );

    return res
      .status(201)
      .json({ success: true, message: "User registered and email sent", user });
  }
);

// 2. RESEND TOKEN
export const resendToken = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    console.log(email);

    if (!email) {
      throw new AuthenticationError("Email is required");
    }

    const { user } = await registrationService.resendVerificationTokenService(
      email
    );

    return res.status(200).json({ success: true, message: "Email sent", user });
  }
);

// 3. VERIFY EMAIL
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { token } = req.body;

    const { user } = await registrationService.verifyUserEmailService(token);

    return res
      .status(200)
      .json({ success: true, message: "Email verified", user });
  }
);

// 4. LOGIN
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    const { user } = await loginService.loginService(res, email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  }
);

// 5. GOOGLE LOGIN
export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, picture } = req.body;

  const user = await loginService.googleLoginService(res, name, email, picture);

  return res
    .status(200)
    .json({ success: true, message: "Login successful", user });
});

// 6. GET LOGGED IN USER DATA
export const loggedInUser = asyncHandler((req: Request, res: Response): any => {
  const user = req.user;

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  return res
    .status(200)
    .json({ success: true, message: "User logged in", user });
});

// 7. UPDATE USER DATA
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { name, email } = req.body;

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const result = await profileService.updateProfileService(
    user.id,
    name,
    email,
    user.email,
    req.file
  );

  if (result.emailChangeRequested) {
    return res.status(200).json({
      success: true,
      message: result.message,
      user: result.user,
    });
  }

  return res
    .status(200)
    .json({ success: true, message: "User updated", user: result.user });
});

// 8. VERIFY NEW EMAIL
export const verifyNewEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.body;

    const { user } = await profileService.verifyNewEmailService(token);

    return res
      .status(200)
      .json({ success: true, message: "Email updated", user });
  }
);

// 9. UPDATE PASSWORD
export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { password, newPassword } = req.body;

    await passwordService.updatePasswordService(req, password, newPassword);

    return res.status(200).json({
      success: true,
      message: "Complete your password change, check your email inbox",
    });
  }
);

// 10. VERIFY NEW PASSWORD
export const verifyNewPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.body;

    await passwordService.verifyNewPasswordService(token);

    return res.status(200).json({ success: true, message: "Password updated" });
  }
);

// 11. FORGOT PASSWORD
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await passwordService.forgotPasswordService(email);

    return res.status(200).json({
      success: true,
      message: "Complete your password reset, check your email inbox",
    });
  }
);

// 12. RESET PASSWORD VERIFY
export const resetPasswordVerify = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await passwordService.resetPasswordVerifyService(token, newPassword);
    return res.status(200).json({ success: true, message: "Password updated" });
  }
);

// 13. LOG OUT
export const logout = asyncHandler((req: Request, res: Response): any => {
  clearCookie(res);

  return res.status(200).json({ success: true, message: "Logout success" });
});

// 14. DELETE ACCOUNT
export const deleteAccount = asyncHandler(async (req: any, res: Response) => {
  const user = req.user;

  if (user.image && user.image.public_id) {
    await deleteImage(user.image.public_id, user.image.id);
  }

  await prismaClient.user.delete({
    where: {
      id: user.id,
    },
  });

  clearCookie(res);

  return res.status(200).json({ success: true, message: "Account deleted" });
});
