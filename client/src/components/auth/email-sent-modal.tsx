"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void; // Function to close the modal
  title: string;
  email?: string;
  description: string;
  additionalInfo?: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  showLoginLink?: boolean;
}

export function EmailSentModal({
  isOpen,
  onClose,
  title,
  email,
  description,
  additionalInfo,
  primaryButtonText = "Close",
  primaryButtonAction,
  showLoginLink = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key press
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 bg-opacity-50 h-full">
      <div
        ref={modalRef}
        className="relative bg-white rounded-md shadow-lg w-full max-w-md mx-4 p-6"
      >
        {/* Modal Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {email && (
            <p className="text-sm text-gray-600 mt-1">
              We have sent{" "}
              {title.toLowerCase().includes("verification")
                ? "a verification email"
                : "a password reset email"}{" "}
              to <span className="font-bold">{email}</span>.
            </p>
          )}
        </div>
        {/* Modal Content */}
        <div className="space-y-4 py-2">
          <p className="text-gray-700">{description}</p>
          {additionalInfo && (
            <p className="text-sm text-gray-500">{additionalInfo}</p>
          )}
        </div>
        {/* Modal Footer */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            onClick={primaryButtonAction || onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            {primaryButtonText}
          </button>
          {showLoginLink && (
            <Link
              href="/login"
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-center"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
