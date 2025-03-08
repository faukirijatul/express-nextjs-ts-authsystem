import app from "../../../app";
import { prismaClient } from "../../../config/prisma-client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { sendVerificationEmail } from "../../../email/email-service";

jest.mock("jsonwebtoken");
jest.mock("../../../config/prisma-client.ts", () => ({
  prismaClient: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock("../../../email/email-service.ts", () => ({
  sendVerificationEmail: jest.fn(),
}));

describe("POST /api/user/resend-token", () => {
  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword123",
    role: "USER",
    is_active: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (jwt.sign as jest.Mock).mockReturnValue("mockedToken");
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  // 1
  it("should resend verification token", async () => {
    const response = await request(app).post("/api/user/resend-token").send({
      email: mockUser.email,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Email sent",
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        is_active: mockUser.is_active,
        password: null,
      },
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: mockUser.id },
      expect.any(String),
      { expiresIn: "1d" }
    );
    expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(sendVerificationEmail).toHaveBeenCalledWith(mockUser, "mockedToken");
  });

  // 2
  it("should return 404 if user email does not exist", async () => {
    // Mock user not found in database
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/user/resend-token")
      .send({ email: "nonexistent@example.com" });

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: "User not found",
    });

    // Verify email was not sent
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  // 3
  it("should return 400 if email format is invalid", async () => {
    const response = await request(app)
      .post("/api/user/resend-token")
      .send({ email: "invalid-email" });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");

    // Verify no database operations were performed
    expect(prismaClient.user.findUnique).not.toHaveBeenCalled();
  });

  // 4
  it("should return 400 if email is missing", async () => {
    const response = await request(app).post("/api/user/resend-token").send({});

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Validation failed");
  });

  // 5
  it("should handle email service failures", async () => {
    // Mock email sending failure
    (sendVerificationEmail as jest.Mock).mockRejectedValue(
      new Error("Failed to send email")
    );

    const response = await request(app)
      .post("/api/user/resend-token")
      .send({ email: mockUser.email });

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Failed to send email");

    // Verify user was found but email failed
    expect(prismaClient.user.findUnique).toHaveBeenCalled();
  });

  // 6
  it("should handle JWT token generation error", async () => {
    // Mock JWT sign failure
    (jwt.sign as jest.Mock).mockImplementation(() => {
      throw new Error("JWT sign error");
    });

    const response = await request(app)
      .post("/api/user/resend-token")
      .send({ email: mockUser.email });

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("JWT sign error");

    // Verify email was not sent due to token generation failure
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });
});
