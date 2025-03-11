import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isVerificationModalOpen: boolean;
  isResetPasswordModalOpen: boolean;
  resetEmail: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isVerificationModalOpen: false,
  isResetPasswordModalOpen: false,
  resetEmail: "",
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
        "http://localhost:8500/api/users/register",
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
      const response = await axios.post(
        "http://localhost:8500/api/users/verify-email",
        { token }
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

// resend verification token
export const resendVerificationToken = createAsyncThunk(
  "auth/resendVerificationToken",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:8500/api/users/resend-token",
        { email }
      );
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
        "http://localhost:8500/api/users/login",
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

// forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (userData: { email: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:8500/api/users/forgot-password",
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
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
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
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
      });
  },
});

export const { resetError, closeVerificationModal, closeResetPasswordModal } =
  authSlice.actions;
export default authSlice.reducer;
