import request from "supertest";
import express from "express";
import http from "http";
import app from "../../app";

describe("Base Tests", () => {
  let server: http.Server;

  beforeAll((done) => {
    // Create a new server on a different port just for testing
    server = app.listen(0, () => {
      console.log("Test server started on random port");
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("GET /test", () => {
    it("Should return 200 and correct message", async () => {
      const response = await request(server).get("/test");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Server is running");
    });
  });

  describe("Non-existent routes", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(server).get("/non-existent-route");
      expect(response.status).toBe(404);
    });
  });
});
