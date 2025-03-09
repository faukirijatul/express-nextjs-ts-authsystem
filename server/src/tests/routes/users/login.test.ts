import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prismaClient } from "../../../config/prisma-client";
import app from "../../../app";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../config/prisma-client", () => ({
  prismaClient: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("POST /api/users/login", () => {
  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword123",
    role: "USER",
    is_active: true,
    image: {
      id: "img-123",
      url: "https://example.com/avatar.jpg",
      public_id: "users/avatar-123",
    },
  };

  const loginCredentials = {
    email: "test@example.com",
    password: "Password123!",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock)
      .mockReturnValueOnce("mock-access-token")
      .mockReturnValueOnce("mock-refresh-token");
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  // 1
  it("should login user successfully", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send(loginCredentials);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Login successful",
      user: {
        ...mockUser,
        password: null,
      },
    });

    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.length).toBe(2);
    expect(cookies[0]).toContain("accessToken");
    expect(cookies[1]).toContain("refreshToken");

    expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginCredentials.email },
      include: {
        image: {
          select: {
            id: true,
            url: true,
            public_id: true,
          },
        },
      },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      loginCredentials.password,
      mockUser.password
    );
    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(jwt.sign).toHaveBeenNthCalledWith(
      1,
      { userId: mockUser.id },
      expect.any(String),
      { expiresIn: "5m" }
    );
    expect(jwt.sign).toHaveBeenNthCalledWith(
      2,
      { userId: mockUser.id },
      expect.any(String),
      { expiresIn: "30d" }
    );
  });

  // 2
  it("should return 400 if email format is invalid", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "invalid-email",
      password: loginCredentials.password,
    });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");

    expect(prismaClient.user.findUnique).not.toHaveBeenCalled();
  });

  // 3
  it("should return 400 if password is missing", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: loginCredentials.email,
      // Missing password
    });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");
  });

  // 4
  it("should return 401 if user is not found", async () => {
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/users/login")
      .send(loginCredentials);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      message: "Username or password incorrect",
    });

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  // 5
  it("should return 401 if password is incorrect", async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await request(app)
      .post("/api/users/login")
      .send(loginCredentials);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      message: "Username or password incorrect",
    });

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  // 6
  it("should handle bcrypt comparison errors", async () => {
    (bcrypt.compare as jest.Mock).mockRejectedValue(new Error("Bcrypt error"));

    const response = await request(app)
      .post("/api/users/login")
      .send(loginCredentials);

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Bcrypt error");
  });
});
