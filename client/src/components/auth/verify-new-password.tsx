"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { verifyNewPassword } from "@/lib/store/features/auth/auth-slice";
import Link from "next/link";

type Props = {
  token: string;
};

const VerifyNewPasswordComp = ({ token }: Props) => {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);
  const [activationStatus, setActivationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activateUserAccount = async () => {
      if (token) {
        try {
          await dispatch(verifyNewPassword(token)).unwrap();
          setActivationStatus("success");
        } catch (err) {
          setActivationStatus("error");
          console.log(err);
        }
      }
    };

    activateUserAccount();
  }, [dispatch, token]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsDialogOpen(false);
      }
    }

    if (isDialogOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDialogOpen]);

  return (
    <div className="w-[450px] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Card Header */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">
          New Password Verification
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {activationStatus === "pending" &&
            "Your new password is being changed..."}
          {activationStatus === "success" && "Your password has been changed!"}
          {activationStatus === "error" &&
            "Password change failed. Please try again."}
        </p>
      </div>

      {/* Card Content */}
      <div className="flex flex-col items-center justify-center py-8 px-6">
        {activationStatus === "pending" && (
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="animate-spin h-16 w-16 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-center text-gray-600">
              Changing your new password, please wait...
            </p>
          </div>
        )}

        {activationStatus === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div className="text-center space-y-2">
              <p className="text-xl font-medium">Congratulation!</p>
              <p className="text-gray-600">
                Your password has been successfully changed.
              </p>
            </div>
          </div>
        )}

        {activationStatus === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div className="text-center space-y-2">
              <p className="text-xl font-medium">Change Password Failed</p>
              <p className="text-gray-600">
                {error || "The activation link is invalid or has expired."}
              </p>
              <p className="text-sm text-gray-500">
                Please contact support if you need further assistance.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex justify-center border-t p-6 bg-gray-50">
        <Link
          href="/profile"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Back To Profile
        </Link>
      </div>
    </div>
  );
};

export default VerifyNewPasswordComp;
