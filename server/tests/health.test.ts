import request from "supertest";

// These tests only exercise validation/routing logic that runs before any
// database call, so we mock the Prisma client rather than requiring a real
// database connection (and a successful `prisma generate`) just to boot
// the Express app in CI.
jest.mock("../src/config/prisma", () => ({
  __esModule: true,
  default: {},
}));

// eslint-disable-next-line import/first
import { app } from "../src/index";

describe("GET /api/health", () => {
  it("responds with the consistent { success, data, message } shape", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: expect.any(String) });
    expect(res.body.data).toHaveProperty("timestamp");
  });
});

describe("POST /api/auth/register", () => {
  it("rejects a request missing required fields before touching the database", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/required/i);
  });

  it("rejects a password under 6 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "a@b.com", password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/6 characters/i);
  });
});

describe("Unknown route", () => {
  it("returns a 404 in the standard response shape", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
