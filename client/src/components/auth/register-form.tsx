"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  closeVerificationModal,
  registerUser,
} from "@/lib/store/features/auth/auth-slice";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { EmailSentModal } from "./email-sent-modal";

// Validation schema matching the backend requirements
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const { isLoading, error, user, isVerificationModalOpen } = useAppSelector(
    (state) => state.auth
  );

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  async function onSubmit(data: RegisterFormValues) {
    await dispatch(registerUser(data));
  }

  return (
    <>
      <div className="bg-white rounded-md shadow-md overflow-hidden w-[450px]">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Register</h2>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name..."
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  form.formState.errors.name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

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
                  form.formState.errors.email
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
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  form.formState.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
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
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-center border-t p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
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
        isOpen={isVerificationModalOpen}
        onClose={() => dispatch(closeVerificationModal())}
        title="Email Verification Required"
        email={user?.email}
        description="Please check your inbox and click on the verification link to activate your account. The verification link will be active for 24 hours."
        additionalInfo="If you do not see the email, please check your spam folder."
      />
    </>
  );
}
