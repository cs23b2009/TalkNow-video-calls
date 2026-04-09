import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";

describe("Auth API", () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: "password123",
    fullName: "Test User",
  };

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
  });

  it("should signup a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body).toHaveProperty("streamToken");
  });

  it("should login the user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.body).toHaveProperty("streamToken");
  });

  it("should return 401 for invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      });

    expect(res.statusCode).toEqual(401);
  });
});
