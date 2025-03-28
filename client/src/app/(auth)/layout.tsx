import { Metadata } from "next";
import Link from "next/link";
// import AuthProtector from "./auth-protector";

export const metadata: Metadata = {
  title: "Authentication",
  description:
    "Authentication forms including login, register, and password reset",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <AuthProtector /> */}
      <div className="min-h-screen items-center justify-center bg-gray-100">
        <div className="text-2xl font-bold w-full border-b border-b-gray-200 bg-white p-5">
          <Link href="/">{process.env.NEXT_PUBLIC_APP_NAME}</Link>
        </div>
        <div className="flex h-full w-full items-center justify-center py-10">
          <div className="mx-auto flex w-full flex-col justify-center items-center space-y-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
