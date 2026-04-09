import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";
import jwt from "jsonwebtoken";

describe("Profile Update API", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await User.deleteMany({ email: "profile_update@example.com" });
    const user = await User.create({
      email: "profile_update@example.com",
      password: "password123",
      fullName: "Original Name",
      isOnboarded: true,
    });
    userId = user._id;
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
  });

  afterAll(async () => {
    await User.deleteOne({ _id: userId });
  });

  it("should update user profile details", async () => {
    const updatedData = {
      fullName: "Updated Name",
      bio: "Updated Bio",
      nativeLanguage: "english",
      learningLanguage: "spanish",
      location: "New Location",
    };

    const res = await request(app)
      .put("/api/auth/update-profile")
      .set("Cookie", [`jwt=${token}`])
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.fullName).toEqual("Updated Name");
    expect(res.body.user.bio).toEqual("Updated Bio");
    
    // Verify in database
    const userInDb = await User.findById(userId);
    expect(userInDb.fullName).toEqual("Updated Name");
  });
});
