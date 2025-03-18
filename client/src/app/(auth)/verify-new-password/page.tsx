"use client";

import VerifyNewPasswordComp from "@/components/auth/verify-new-password";
import { useSearchParams } from "next/navigation";
import { Toaster } from "sonner";
import { Suspense } from "react";

export default function VerifyNewPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-muted-foreground">
            Loading...
          </p>
        </div>
      }
    >
      <VerifyNewPasswordContent />
    </Suspense>
  );
}

function VerifyNewPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          New Password Verification
        </h1>
        <p className="text-sm text-muted-foreground">
          Verify your new password to complete your password update.
        </p>
      </div>
      <VerifyNewPasswordComp token={token} />
      <Toaster position="top-center" />
    </>
  );
}
