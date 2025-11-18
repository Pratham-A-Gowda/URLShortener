const express = require("express");
const request = require("supertest");

jest.mock("../db", () => ({ query: jest.fn() }));
const db = require("../db");

jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));
const { verify } = require("jsonwebtoken");

const auth = require("../middlewares/auth");

function makeApp() {
  const app = express();
  app.get("/protected", auth, (req, res) =>
    res.json({ ok: true, user: req.user })
  );
  return app;
}

describe("middlewares/auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("401 when no token", async () => {
    const app = makeApp();
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("No token");
  });

  test("401 when invalid token", async () => {
    verify.mockImplementationOnce(() => {
      throw new Error("bad");
    });
    const app = makeApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer bad");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid");
  });

  test("401 when user not found", async () => {
    verify.mockImplementationOnce(() => ({ sub: 9 }));
    db.query.mockResolvedValueOnce({ rows: [] });
    const app = makeApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer good");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid");
  });

  test("200 and attaches req.user when valid", async () => {
    verify.mockImplementationOnce(() => ({ sub: 42 }));
    db.query.mockResolvedValueOnce({
      rows: [{ id: 42, email: "x@y.com", is_admin: false }],
    });
    const app = makeApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer good");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user).toMatchObject({
      id: 42,
      email: "x@y.com",
      is_admin: false,
    });
  });
});
