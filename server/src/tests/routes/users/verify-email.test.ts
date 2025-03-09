import request from "supertest";
import jwt from "jsonwebtoken";
import { prismaClient } from "../../../config/prisma-client";
import app from "../../../app";

jest.mock("jsonwebtoken");
jest.mock("../../../config/prisma-client", () => ({
  prismaClient: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("POST /api/users/verify-email", () => {
  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    role: "USER",
    is_active: false,
    createdAt: "stringdate",
    updatedAt: "stringdate",
  };

  const verifiedMockUser = {
    ...mockUser,
    is_active: true,
  };

  const mockToken = "valid-jwt-token";
  const mockPayload = { userId: mockUser.id };

  beforeEach(() => {
    jest.clearAllMocks();

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
    (prismaClient.user.findUnique as jest.Mock).mockReturnValue(mockUser);
    (prismaClient.user.update as jest.Mock).mockReturnValue(verifiedMockUser);
  });

  // 1
  it("should verify email successfully", async () => {
    const response = await request(app)
      .post("/api/users/verify-email")
      .send({ token: mockToken });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Email verified",
      user: verifiedMockUser,
    });

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    });
    expect(prismaClient.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { is_active: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  // 2
  it("should return 400 if token is missing", async () => {
    const response = await request(app)
      .post("/api/users/verify-email")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(prismaClient.user.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
  });

  // 3
  it("should return 500 if token is invalid", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid token");
    });

    const response = await request(app)
      .post("/api/users/verify-email")
      .send({ token: "invalid token" });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Server error");

    expect(prismaClient.user.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
  });

  // 4
  it("should return 500 if token is expired", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError("jwt expired", new Date());
    });

    const response = await request(app)
      .post("/api/users/verify-email")
      .send({ token: "expired-token" });

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Server error");

    // Verify no database operations were performed
    expect(prismaClient.user.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
  });

  // 5
  it("should return 404 if user not found", async () => {
    // Mock user not found in database
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/users/verify-email")
      .send({ token: mockToken });

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: "User not found",
    });

    // Verify user was not updated
    expect(prismaClient.user.update).not.toHaveBeenCalled();
  });

  // 6
  it("should handle database errors during update", async () => {
    (prismaClient.user.update as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .post("/api/users/verify-email")
      .send({ token: mockToken });

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Database error");
  });
});
