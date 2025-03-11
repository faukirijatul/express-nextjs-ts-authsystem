"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Toaster } from "sonner";

export default function LoginPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Login to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to access your account
        </p>
      </div>
      <LoginForm />
      <Toaster position="top-center" />
    </>
  );
}
