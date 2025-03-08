import request from "supertest";
import app from "../../app";

describe("Base Tests", () => {
  describe("GET /test", () => {
    it("Should return 200 and correct message", async () => {
      const response = await request(app).get("/test");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Server is running");
    });
  });

  describe("Non-existent routes", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app).get("/non-existent-route");
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("not found");
    });
  });
});
