"use client";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a new strong password for your account
        </p>
      </div>
      <ResetPasswordForm token={token} />
      <Toaster position="top-center" />
    </>
  );
}
