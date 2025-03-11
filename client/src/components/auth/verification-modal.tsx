"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeVerificationModal } from "@/lib/store/features/auth/auth-slice";
import Link from "next/link";

export function VerificationModal() {
  const dispatch = useAppDispatch();
  const { isVerificationModalOpen, user } = useAppSelector(
    (state) => state.auth
  );
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        dispatch(closeVerificationModal());
      }
    }

    if (isVerificationModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVerificationModalOpen, dispatch]);

  // Handle ESC key press
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dispatch(closeVerificationModal());
      }
    }

    if (isVerificationModalOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVerificationModalOpen, dispatch]);

  if (!isVerificationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 bg-opacity-50">
      <div
        ref={modalRef}
        className="relative bg-white rounded-md shadow-lg w-full max-w-md mx-4 p-6"
      >
        {/* Modal Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Email Verification Required
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            We have sent a verification email to{" "}
            <span className="font-bold">{user?.email}</span>.
          </p>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 py-2">
          <p className="text-gray-700">
            Please check your inbox and click on the verification link to
            activate your account. The verification link will be active for 24
            hours.
          </p>
          <p className="text-sm text-gray-500">
            If you do not see the email, please check your spam folder.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            onClick={() => dispatch(closeVerificationModal())}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Close
          </button>
          <Link
            href="/login"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
