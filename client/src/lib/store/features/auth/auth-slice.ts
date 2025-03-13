import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  image?: {
    id?: string;
    url?: string;
    public_id?: string | null;
  } | null;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  registeringUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isGetUserInfoLaoding: boolean;
  isVerificationModalOpen: boolean;
  isResetPasswordModalOpen: boolean;
  resetEmail: string;
  resetSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  registeringUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isGetUserInfoLaoding: false,
  isVerificationModalOpen: false,
  isResetPasswordModalOpen: false,
  resetEmail: "",
  resetSuccess: false,
};

interface ApiErrorResponse {
  message: string;
}

// Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/users/register`,
        userData
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Registration failed"
      );
    }
  }
);

// verify email
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${serverUrl}/api/users/verify-email`, {
        token,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Verification failed"
      );
    }
  }
);

// resend verification token
export const resendVerificationToken = createAsyncThunk(
  "auth/resendVerificationToken",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${serverUrl}/api/users/resend-token`, {
        email,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Resend token failed"
      );
    }
  }
);

// login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/users/login`,
        userData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Login failed"
      );
    }
  }
);

// google login
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (
    userData: { name: string; email: string; picture: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/users/google-login`,
        userData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Google login failed"
      );
    }
  }
);

// get logged in user data
export const loggedInUser = createAsyncThunk(
  "auth/loggedInUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${serverUrl}/api/users/me`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Get user data failed"
      );
    }
  }
);

// update user profile
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${serverUrl}/api/users/update-user`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Update user failed"
      );
    }
  }
);

// verify email
export const verifyNewEmail = createAsyncThunk(
  "auth/verifyNewEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/users/verify-new-email`,
        {
          token,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Verification failed"
      );
    }
  }
);

// update user profile
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (
    formData: { password: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/users/update-password`,
        formData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Update user failed"
      );
    }
  }
);

// verify email
export const verifyNewPassword = createAsyncThunk(
  "auth/verifyNewPassword",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/users/verify-new-password`,
        {
          token,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Verification failed"
      );
    }
  }
);

// forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (userData: { email: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/users/forgot-password`,
        userData
      );
      return { ...response.data, email: userData.email };
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Password reset request failed"
      );
    }
  }
);

// reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    userData: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/users/reset-password-verify`,
        userData
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Password reset failed"
      );
    }
  }
);

// logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${serverUrl}/api/users/logout`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Logout failed"
      );
    }
  }
);

// delete account
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${serverUrl}/api/users/delete-account`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Delete account failed"
      );
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    closeVerificationModal: (state) => {
      state.isVerificationModalOpen = false;
    },
    closeResetPasswordModal: (state) => {
      state.isResetPasswordModalOpen = false;
    },
    resetPasswordState: (state) => {
      state.resetSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registeringUser = action.payload.user;
        state.isVerificationModalOpen = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(resendVerificationToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationToken.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendVerificationToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loggedInUser.pending, (state) => {
        state.isGetUserInfoLaoding = true;
        state.error = null;
      })
      .addCase(loggedInUser.fulfilled, (state, action) => {
        state.isGetUserInfoLaoding = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loggedInUser.rejected, (state) => {
        state.isGetUserInfoLaoding = false;
        state.isAuthenticated = false;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyNewEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyNewEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(verifyNewEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyNewPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyNewPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyNewPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isResetPasswordModalOpen = true;
        state.resetEmail = action.payload.email;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.resetSuccess = false;
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetError,
  closeVerificationModal,
  closeResetPasswordModal,
  resetPasswordState,
} = authSlice.actions;
export default authSlice.reducer;
