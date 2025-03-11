"use client";

import { RegisterForm } from "@/components/auth/register-form";
import { Toaster } from "sonner";

export default function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Create your account to get started
        </p>
      </div>

      <RegisterForm />

      <Toaster position="top-center" />
    </>
  );
}
