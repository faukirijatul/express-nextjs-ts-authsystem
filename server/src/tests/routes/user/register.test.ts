import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prismaClient } from "../../../config/prisma-client";
import app from "../../../app";
import { sendVerificationEmail } from "../../../email/email-service";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../config/prisma-client.ts", () => ({
  prismaClient: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));
jest.mock("../../../email/email-service.ts", () => ({
  sendVerificationEmail: jest.fn(),
}));

describe("POST /api/users/register", () => {
  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
    role: "USER",
    is_active: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
    (jwt.sign as jest.Mock).mockReturnValue("mocked-jwt-token");
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaClient.user.create as jest.Mock).mockResolvedValue({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      is_active: mockUser.is_active,
    });
  });

  // 1
  it("should register a new user successfully", async () => {
    const response = await request(app).post("/api/users/register").send({
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: "User registered and email sent",
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        is_active: mockUser.is_active,
      },
    });

    expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10);
    expect(prismaClient.user.create).toHaveBeenCalledWith({
      data: {
        name: mockUser.name,
        email: mockUser.email,
        password: "hashedPassword123",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
      },
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: mockUser.id },
      expect.any(String),
      { expiresIn: "1d" }
    );
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        is_active: mockUser.is_active,
      },
      "mocked-jwt-token"
    );
  });

  // 2
  it("should return 409 if email already exists", async () => {
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app).post("/api/users/register").send({
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password,
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      success: false,
      message: "Email already exists",
    });

    expect(prismaClient.user.create).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  // 3
  it("should return 400 if email format is invalid", async () => {
    const response = await request(app).post("/api/users/register").send({
      name: mockUser.name,
      email: "invalid-email",
      password: mockUser.password,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");

    expect(prismaClient.user.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.user.create).not.toHaveBeenCalled();
  });

  // 4
  it("should return 400 if password does not meet requirements", async () => {
    const response = await request(app).post("/api/users/register").send({
      name: mockUser.name,
      email: mockUser.email,
      password: "weak",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");

    expect(prismaClient.user.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.user.create).not.toHaveBeenCalled();
  });

  // 5
  it("should return 400 if required fields are missing", async () => {
    const response = await request(app).post("/api/users/register").send({
      name: mockUser.name,
      // Missing email and password
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");
  });

  // 6
  it("should handle email service failures", async () => {
    // Mock email sending failure
    (sendVerificationEmail as jest.Mock).mockRejectedValue(
      new Error("Failed to send email")
    );

    const response = await request(app).post("/api/users/register").send({
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password,
    });

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Failed to send email");

    // Verify user was still created but email failed
    expect(prismaClient.user.create).toHaveBeenCalled();
  });
});
