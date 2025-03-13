"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut, useSession } from "next-auth/react";
import {
  updatePassword,
  updateUser,
  deleteAccount,
} from "@/lib/store/features/auth/auth-slice";
import ImageUpload from "@/components/main/image-upload";
import ConfirmationModal from "@/components/main/confirmation-modal";
import { useRouter } from "next/navigation";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

// Password change form schema
const passwordSchema = z.object({
  password: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// Tab options
type TabType = "profile" | "password" | "delete";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showEmailWarning, setShowEmailWarning] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();

  // State for confirmation modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingData, setPendingData] = useState<ProfileFormValues | null>(
    null
  );
  const [pendingPasswordData, setPendingPasswordData] =
    useState<PasswordFormValues | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
    },
  });

  const currentEmail = profileForm.watch("email");

  useEffect(() => {
    if (user?.email && currentEmail !== user.email) {
      setShowEmailWarning(true);
    } else {
      setShowEmailWarning(false);
    }
  }, [currentEmail, user?.email]);

  const handleImageChange = ({
    file,
  }: {
    base64: string | null;
    file: File | null;
  }) => {
    setImageFile(file);
  };

  // Handler for profile form submission - just opens the confirmation modal
  const onProfileSubmit = (data: ProfileFormValues) => {
    // Check if anything has changed
    const hasNameChanged = data.name !== user?.name;
    const hasEmailChanged = data.email !== user?.email;
    const hasImageChanged = imageFile !== null;

    if (hasNameChanged || hasEmailChanged || hasImageChanged) {
      // Store the data to be submitted after confirmation
      setPendingData(data);
      setShowConfirmModal(true);
    } else {
      // Nothing changed, just close edit mode
      setIsEditing(false);
      toast.info("No changes to save");
    }
  };

  // Handler for password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    setPendingPasswordData(data);
    setShowPasswordModal(true);
  };

  // The actual profile update function that will be called after confirmation
  const processProfileUpdate = async () => {
    if (!pendingData) return;

    try {
      // Create update payload
      const updateData: {
        name?: string;
        email?: string;
        image?: File;
      } = {};

      // Only add values that have been changed
      if (pendingData.name !== user?.name) {
        updateData.name = pendingData.name;
      }

      if (pendingData.email !== user?.email) {
        updateData.email = pendingData.email;
      }

      if (imageFile) {
        updateData.image = imageFile;
      }

      // Create FormData to send the file
      const formData = new FormData();

      if (updateData.name) {
        formData.append("name", updateData.name);
      }

      if (updateData.email) {
        formData.append("email", updateData.email);
      }

      if (updateData.image) {
        formData.append("image", updateData.image);
      }

      // Update dispatch call to handle FormData
      await dispatch(updateUser(formData));

      setIsEditing(false);
      setImageFile(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setShowConfirmModal(false);
      setPendingData(null);
    }
  };

  // Process password change
  const processPasswordChange = async () => {
    if (!pendingPasswordData) return;

    try {
      const passwordData = {
        password: pendingPasswordData.password,
        newPassword: pendingPasswordData.newPassword,
      };

      await dispatch(updatePassword(passwordData));

      passwordForm.reset();
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Failed to update password");
    } finally {
      setShowPasswordModal(false);
      setPendingPasswordData(null);
    }
  };

  // Process account deletion
  const processAccountDeletion = async () => {
    try {
      await dispatch(deleteAccount());

      if (session) {
        await signOut({ callbackUrl: "/" });
      }

      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error("Failed to delete account");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const cancelEdit = () => {
    profileForm.reset({
      name: user?.name || "",
      email: user?.email || "",
    });
    setImageFile(null);
    setIsEditing(false);
  };

  // Determine what changes are being made for the profile confirmation message
  const getProfileConfirmationMessage = () => {
    if (!pendingData || !user)
      return "Are you sure you want to update your profile?";

    const changes = [];

    if (pendingData.name !== user.name) {
      changes.push(
        `Name will be changed from "${user.name}" to "${pendingData.name}"`
      );
    }

    if (pendingData.email !== user.email) {
      changes.push(
        `Email will be changed from "${user.email}" to "${pendingData.email}". You need to verify your new email before it will be updated.`
      );
    }

    if (imageFile) {
      changes.push("Profile picture will be updated");
    }

    if (changes.length === 0) return "No changes detected.";

    return (
      <div>
        <p className="mb-2">Please confirm the following changes:</p>
        <ul className="list-disc pl-5 space-y-1">
          {changes.map((change, index) => (
            <li key={index}>{change}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Message for password change confirmation
  const getPasswordConfirmationMessage = () => {
    return (
      <div>
        <p>Are you sure you want to change your password?</p>
        <p className="mt-2">
          Please check your email to finish the password change process.
        </p>
      </div>
    );
  };

  // Message for account deletion confirmation
  const getDeleteConfirmationMessage = () => {
    return (
      <div>
        <p className="text-red-600 font-medium">
          Warning: This action cannot be undone.
        </p>
        <p className="mt-2">
          Are you sure you want to permanently delete your account? All your
          data will be removed from our systems.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-md shadow-md border overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-red-500 text-red-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "password"
                ? "border-b-2 border-red-500 text-red-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "delete"
                ? "border-b-2 border-red-500 text-red-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("delete")}
          >
            Delete Account
          </button>
        </div>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === "profile"
              ? "Profile Information"
              : activeTab === "password"
              ? "Change Password"
              : "Delete Account"}
          </h2>
          <p className="text-sm text-gray-600">
            {activeTab === "profile"
              ? "Personal details and account settings"
              : activeTab === "password"
              ? "Update your password to secure your account"
              : "Permanently remove your account and personal data"}
          </p>
        </div>

        <div className="p-6">
          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <div className="flex flex-col md:flex-row gap-8 mb-6">
                {/* Profile Image using the new component */}
                <ImageUpload
                  currentImage={user?.image?.url || null}
                  onImageChange={handleImageChange}
                  size={160}
                  disabled={!isEditing}
                  placeholderText={
                    isEditing
                      ? "Change Photo"
                      : user?.name?.charAt(0).toUpperCase() || "U"
                  }
                />

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <>
                      {/* Name Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            profileForm.formState.errors.name
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={isLoading}
                          {...profileForm.register("name")}
                        />
                        {profileForm.formState.errors.name && (
                          <p className="text-sm text-red-500">
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          placeholder="youremail@example.com"
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            profileForm.formState.errors.email
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${session ? "bg-gray-200 cursor-not-allowed" : ""}`}
                          disabled={isLoading}
                          readOnly={session ? true : false}
                          {...profileForm.register("email")}
                        />
                        {profileForm.formState.errors.email && (
                          <p className="text-sm text-red-500">
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <p className="mt-1 text-gray-900">{user?.name}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <p className="mt-1 text-gray-900 capitalize">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Account Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user?.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Joined On
                    </label>
                    <p className="mt-1 text-gray-900">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {showEmailWarning && (
                <div className="my-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Email Change Information
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          If you change your email address, a verification email
                          will be sent to the new address. You will need to
                          verify this email before the change takes effect.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer with buttons */}
              <div className="border-t pt-6 mt-6 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2
                            size={16}
                            color="white"
                            className="mr-2 animate-spin"
                          />
                          Saving...
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-200 shadow-sm cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Password Tab Content */}
          {activeTab === "password" && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <div className="space-y-6">
                {/* Current Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your current password"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      passwordForm.formState.errors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    {...passwordForm.register("password")}
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      passwordForm.formState.errors.newPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <p className="text-sm text-gray-600 mb-6">
                    Password must be at least 8 characters long and must contain
                    at least one uppercase letter, one lowercase letter, and one
                    number.
                  </p>

                  <div className="my-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Password Change Information
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            If you change your password, a verification email
                            will be sent to the email. You will need to verify
                            this email before the change takes effect.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2
                          size={16}
                          color="white"
                          className="mr-2 animate-spin"
                        />
                        Updating Password...
                      </div>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Delete Account Tab Content */}
          {activeTab === "delete" && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p className="mb-2">
                        Deleting your account is a permanent action and cannot
                        be undone. After deletion:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          All your personal data will be removed from our
                          systems
                        </li>
                        <li>
                          You will lose access to all your content and settings
                        </li>
                        <li>
                          You will need to create a new account if you wish to
                          return
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Update Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={processProfileUpdate}
        title="Confirm Profile Update"
        message={getProfileConfirmationMessage()}
        confirmButtonText={isLoading ? "Updating..." : "Confirm Update"}
        cancelButtonText="Cancel"
        isLoading={isLoading}
      />

      {/* Password Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={processPasswordChange}
        title="Confirm Password Change"
        message={getPasswordConfirmationMessage()}
        confirmButtonText={isLoading ? "Updating..." : "Change Password"}
        cancelButtonText="Cancel"
        isLoading={isLoading}
      />

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={processAccountDeletion}
        title="Confirm Account Deletion"
        message={getDeleteConfirmationMessage()}
        confirmButtonText={isLoading ? "Deleting..." : "Delete Account"}
        cancelButtonText="Cancel"
        isLoading={isLoading}
      />
    </div>
  );
}
