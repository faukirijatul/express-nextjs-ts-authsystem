"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { googleLogin } from "@/lib/store/features/auth/auth-slice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function GoogleLoginButton() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const { data: session } = useSession();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      try {
        if (session && session.user) {
          const userData = {
            name: session.user.name || "",
            email: session.user.email || "",
            picture: session.user.image || "",
          };
          await dispatch(googleLogin(userData));
          router.push("/");
        }
      } catch (error) {
        console.log(error);
      }
    };

    handleGoogleLogin();
  }, [session, dispatch, router]);

  return (
    <>
      <div className="flex items-center justify-center my-4">
        <span className="w-full border-t border-gray-300"></span>
        <span className="px-4 text-gray-500">or</span>
        <span className="w-full border-t border-gray-300"></span>
      </div>

      <button
        type="button"
        onClick={() => signIn("google")}
        disabled={isLoading}
        className="w-full py-2 px-4 border border-gray-300 bg-white text-gray-700 font-medium rounded-md transition duration-200 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
      >
        <Image
          src="/Google.svg"
          alt="Google"
          className="mr-2"
          width={25}
          height={25}
        />
        Login with Google
      </button>
    </>
  );
}
