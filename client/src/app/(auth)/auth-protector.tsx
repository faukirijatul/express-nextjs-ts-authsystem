"use client";

import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthProtector() {
  const router = useRouter();
  const { user, isAuthenticated, isGetUserInfoLaoding } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user && isAuthenticated && !isGetUserInfoLaoding) {
      router.push("/");
    }
  }, [isAuthenticated, user, isGetUserInfoLaoding, router]);

  return null;
}
