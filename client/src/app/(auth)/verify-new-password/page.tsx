"use client";

import VerifyNewPasswordComp from "@/components/auth/verify-new-password";
import { useSearchParams } from "next/navigation";
import { Toaster } from "sonner";

export default function VerifyNewEmailPage() {
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
