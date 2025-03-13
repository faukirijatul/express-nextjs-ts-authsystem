"use client";

import VerifyNewEmailComp from "@/components/auth/verify-new-email";
import { useSearchParams } from "next/navigation";
import { Toaster } from "sonner";

export default function VerifyNewEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Email Verification
        </h1>
        <p className="text-sm text-muted-foreground">
          Verify your new email address to complete your email update.
        </p>
      </div>
      <VerifyNewEmailComp token={token} />
      <Toaster position="top-center" />
    </>
  );
}
