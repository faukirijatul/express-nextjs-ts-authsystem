"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  closeResetPasswordModal,
  forgotPassword,
} from "@/lib/store/features/auth/auth-slice";
import { useEffect } from "react";
import { EmailSentModal } from "./email-sent-modal";

// Validation schema for the forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const { isLoading, error, isResetPasswordModalOpen, resetEmail } =
    useAppSelector((state) => state.auth);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  async function onSubmit(data: ForgotPasswordFormValues) {
    await dispatch(forgotPassword(data));
  }

  return (
    <>
      <div className="bg-white rounded-md shadow-md overflow-hidden w-[450px]">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="youremail@example.com"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  form.formState.errors.email || error
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2
                    size={16}
                    color="white"
                    className="mr-2 animate-spin"
                  />
                  Sending request...
                </div>
              ) : (
                "Request Password Reset"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-center border-t p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      <EmailSentModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => dispatch(closeResetPasswordModal())}
        title="Password Reset Email Sent"
        email={resetEmail}
        description="Please check your inbox and follow the instructions in the email to reset your password."
        additionalInfo="If you do not see the email, please check your spam folder."
      />
    </>
  );
}
