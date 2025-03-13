"use client";

import { SessionProvider } from "next-auth/react";
import { Providers } from "@/lib/providers";
import AuthWrapper from "@/components/auth-wrapper";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Providers>
        <AuthWrapper>{children}</AuthWrapper>
      </Providers>
    </SessionProvider>
  );
}
