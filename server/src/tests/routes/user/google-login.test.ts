import request from "supertest";
import jwt from "jsonwebtoken";
import { prismaClient } from "../../../config/prisma-client";
import app from "../../../app";

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("../../../config/prisma-client", () => ({
  prismaClient: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("POST /api/users/google-login", () => {
  const mockExistingUser = {
    id: "user-123",
    name: "Existing User",
    email: "existing@example.com",
    role: "USER",
    is_active: true,
    image: {
      id: "img-123",
      url: "https://example.com/old-avatar.jpg",
      public_id: null, // No public_id means it's from a social login
    },
  };

  const mockUpdatedUser = {
    ...mockExistingUser,
    image: {
      ...mockExistingUser.image,
      url: "https://example.com/new-avatar.jpg",
    },
  };

  const mockNewUser = {
    id: "user-456",
    name: "New User",
    email: "new@example.com",
    role: "USER",
    is_active: true,
    image: {
      id: "img-456",
      url: "https://example.com/new-user-avatar.jpg",
      public_id: null,
    },
  };

  const googleCredentials = {
    name: "Google User",
    email: "user@example.com",
    picture: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (jwt.sign as jest.Mock)
      .mockReturnValueOnce("mock-access-token") // First call for access token
      .mockReturnValueOnce("mock-refresh-token"); // Second call for refresh token

    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaClient.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
    (prismaClient.user.create as jest.Mock).mockResolvedValue(mockNewUser);
  });

  // 1
  it("should login existing user with Google credentials", async () => {
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(
      mockExistingUser
    );

    const response = await request(app).post("/api/users/google-login").send({
      name: googleCredentials.name,
      email: mockExistingUser.email,
      picture: googleCredentials.picture,
    });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Login successful",
      user: mockExistingUser,
    });

    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.length).toBe(2);
    expect(cookies[0]).toContain("accessToken");
    expect(cookies[1]).toContain("refreshToken");

    expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockExistingUser.email },
      include: { image: true },
    });

    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(jwt.sign).toHaveBeenNthCalledWith(
      1,
      { userId: mockExistingUser.id },
      expect.any(String),
      { expiresIn: "5m" }
    );
    expect(jwt.sign).toHaveBeenNthCalledWith(
      2,
      { userId: mockExistingUser.id },
      expect.any(String),
      { expiresIn: "30d" }
    );
  });

  // 2
  it("should update profile picture for existing user if different", async () => {
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(
      mockExistingUser
    );

    const newPicture = "https://example.com/new-avatar.jpg";

    const response = await request(app).post("/api/users/google-login").send({
      name: googleCredentials.name,
      email: mockExistingUser.email,
      picture: newPicture,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Login successful",
      user: mockUpdatedUser,
    });

    expect(prismaClient.user.update).toHaveBeenCalledWith({
      where: {
        id: mockExistingUser.id,
      },
      data: {
        image: {
          update: {
            url: newPicture,
          },
        },
      },
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
  });

  // 3
  it("should create new user with Google credentials if user does not exist", async () => {
    const response = await request(app)
      .post("/api/users/google-login")
      .send(googleCredentials);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Login successful",
      user: mockNewUser,
    });

    expect(prismaClient.user.create).toHaveBeenCalledWith({
      data: {
        name: googleCredentials.name,
        email: googleCredentials.email,
        is_active: true,
        image: {
          create: {
            url: googleCredentials.picture,
          },
        },
      },
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

    expect(jwt.sign).toHaveBeenCalledTimes(2);
  });

  // 4
  it("should return 400 if email format is invalid", async () => {
    const response = await request(app).post("/api/users/google-login").send({
      name: googleCredentials.name,
      email: "invalid-email",
      picture: googleCredentials.picture,
    });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");

    expect(prismaClient.user.findUnique).not.toHaveBeenCalled();
  });

  // 5
  it("should return 400 if name is missing", async () => {
    const response = await request(app).post("/api/users/google-login").send({
      email: googleCredentials.email,
      picture: googleCredentials.picture,
      // Missing name
    });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");
  });

  // 6
  it("should return 400 if picture URL is invalid", async () => {
    const response = await request(app).post("/api/users/google-login").send({
      name: googleCredentials.name,
      email: googleCredentials.email,
      picture: "invalid-url",
    });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");
  });
});
