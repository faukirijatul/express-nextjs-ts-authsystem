"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loggedInUser } from "@/lib/store/features/auth/auth-slice";
import LoadingOverlay from "./loading-overlay";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const dispatch = useAppDispatch();
  const { isGetUserInfoLaoding, user } = useAppSelector((state) => state.auth);

  console.log(user);

  useEffect(() => {
    dispatch(loggedInUser());
  }, [dispatch]);

  return (
    <>
      {isGetUserInfoLaoding && !user && <LoadingOverlay />}
      {children}
    </>
  );
}
