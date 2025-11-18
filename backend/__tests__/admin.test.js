const express = require("express");
const request = require("supertest");

jest.mock("../db", () => ({ query: jest.fn() }));

const db = require("../db");
const adminRouter = require("../routes/admin");

// Mock jsonwebtoken verify in each test case (set/reset as needed)
jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));
const { verify } = require("jsonwebtoken");

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRouter);
  return app;
}

describe("Admin routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("401 when no token", async () => {
    const app = makeApp();
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("No token");
  });

  test("401 when invalid token", async () => {
    verify.mockImplementationOnce(() => {
      throw new Error("bad");
    });
    const app = makeApp();
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer bad");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid");
  });

  test("403 when not admin", async () => {
    verify.mockImplementationOnce(() => ({ is_admin: false }));
    const app = makeApp();
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer t");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  test("GET /users returns list when admin", async () => {
    verify.mockImplementationOnce(() => ({ is_admin: true }));
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "a@b.com", is_admin: true }],
    });

    const app = makeApp();
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer t");
    expect(res.status).toBe(200);
    expect(res.body.users[0]).toMatchObject({
      id: 1,
      email: "a@b.com",
      is_admin: true,
    });
  });

  test("promote, demote, delete return ok", async () => {
    verify.mockImplementation(() => ({ is_admin: true }));
    db.query.mockResolvedValue({});

    const app = makeApp();
    const promote = await request(app)
      .post("/api/admin/users/5/promote")
      .set("Authorization", "Bearer t");
    expect(promote.status).toBe(200);
    const demote = await request(app)
      .post("/api/admin/users/5/demote")
      .set("Authorization", "Bearer t");
    expect(demote.status).toBe(200);
    const del = await request(app)
      .delete("/api/admin/users/5")
      .set("Authorization", "Bearer t");
    expect(del.status).toBe(200);
    expect(promote.body.ok && demote.body.ok && del.body.ok).toBe(true);
  });
});
