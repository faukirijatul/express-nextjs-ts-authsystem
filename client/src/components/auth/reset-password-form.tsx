"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  resetPassword,
  resetPasswordState,
} from "@/lib/store/features/auth/auth-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, resetSuccess } = useAppSelector(
    (state) => state.auth
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, router]);

  useEffect(() => {
    return () => {
      dispatch(resetPasswordState());
    };
  }, [dispatch]);

  async function onSubmit(data: ResetPasswordFormValues) {
    await dispatch(resetPassword({ token, newPassword: data.newPassword }));
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden w-[450px]">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
      </div>
      {/* Form Content */}
      <div className="p-6">
        {resetSuccess ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-medium text-gray-900">
              Password Reset Successful!
            </h3>
            <p className="text-center text-gray-600">
              Your password has been reset successfully. You will be redirected
              to the login page.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    form.formState.errors.newPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={isLoading}
                  {...form.register("newPassword")}
                />

                {/* Toggle password visibility button */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {form.formState.errors.newPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
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
                  Resetting password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
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
  );
}
