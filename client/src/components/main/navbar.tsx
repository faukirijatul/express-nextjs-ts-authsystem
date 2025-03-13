"use client";

import { useAppSelector } from "@/lib/hooks";
import { logout } from "@/lib/store/features/auth/auth-slice";
import { useAppDispatch } from "@/lib/hooks";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { User, LogOut, Loader2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, isAuthenticated, isGetUserInfoLaoding, isLoading } =
    useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Handle click outside to close the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    setIsMenuOpen(false);

    if (session) {
      await signOut({ callbackUrl: "/" });
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">
                {process.env.NEXT_PUBLIC_APP_NAME || "Our Application"}
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {isAuthenticated && user && !isGetUserInfoLaoding ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 bg-white rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                >
                  {/* User Image */}
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    {user.image?.url ? (
                      <Image
                        src={user.image.url}
                        alt={user.name || "User"}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-200">
                        <Image
                          src="/default-user-avatar.jpg"
                          alt={user.name || "User"}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-4 w-48 py-1 bg-white rounded-md shadow-md border z-10">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-3 h-4 w-4" />
                      )}
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
