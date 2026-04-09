import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";
import jwt from "jsonwebtoken";

describe("User API", () => {
  let token;
  let userId;
  let recipientId;

  beforeAll(async () => {
    // delete previous test users
    await User.deleteMany({ email: /test_user/ });

    // create a user to act as sender
    const user = await User.create({
      email: `test_user_sender_${Date.now()}@example.com`,
      password: "password123",
      fullName: "Sender User",
      isOnboarded: true,
    });
    userId = user._id;

    // create a user to act as recipient
    const recipient = await User.create({
      email: `test_user_recipient_${Date.now()}@example.com`,
      password: "password123",
      fullName: "Recipient User",
      isOnboarded: true,
    });
    recipientId = recipient._id;

    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test_user/ });
  });

  it("should get recommended users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Should include the recipient user
    const recipientInRecommended = res.body.find(u => u._id.toString() === recipientId.toString());
    expect(recipientInRecommended).toBeDefined();
  });

  it("should send a friend request", async () => {
    const res = await request(app)
      .post(`/api/users/friend-request/${recipientId}`)
      .set("Cookie", [`jwt=${token}`]);

    expect(res.statusCode).toEqual(201);
    expect(res.body.sender.toString()).toBe(userId.toString());
    expect(res.body.recipient.toString()).toBe(recipientId.toString());
    expect(res.body.status).toBe("pending");
  });
});
