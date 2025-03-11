"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Toaster } from "sonner";

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>
      <ForgotPasswordForm />
      <Toaster position="top-center" />
    </>
  );
}
