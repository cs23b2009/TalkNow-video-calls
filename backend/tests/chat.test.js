import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";
import jwt from "jsonwebtoken";

describe("Chat API", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await User.deleteMany({ email: "chat_test@example.com" });
    const user = await User.create({
      email: "chat_test@example.com",
      password: "password123",
      fullName: "Chat Test User",
    });
    userId = user._id;
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
  });

  afterAll(async () => {
    await User.deleteOne({ _id: userId });
  });

  it("should get a stream token", async () => {
    const res = await request(app)
      .get("/api/chat/token")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });
});
