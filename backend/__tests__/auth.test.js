const express = require("express");
const request = require("supertest");

jest.mock("../db", () => ({ query: jest.fn() }));
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hash"),
  compare: jest.fn().mockResolvedValue(true),
}));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn().mockReturnValue("token") }));

const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRouter = require("../routes/auth");

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRouter);
  return app;
}

describe("Auth routes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("register -> 400 when missing fields", async () => {
    const app = makeApp();
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing");
  });

  test("register -> 400 when email exists", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const app = makeApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "pass" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email exists");
  });

  test("register -> 200 success returns token and user", async () => {
    // email does not exist
    db.query
      .mockResolvedValueOnce({ rows: [] }) // email check
      .mockResolvedValueOnce({
        rows: [{ id: 2, email: "a@b.com", is_admin: false }],
      }); // insert user

    const app = makeApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "pass" });

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body.token).toBe("token");
    expect(res.body.user).toMatchObject({
      id: 2,
      email: "a@b.com",
      is_admin: false,
    });
  });

  test("login -> 400 invalid email", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const app = makeApp();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@y.com", password: "p" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid");
  });

  test("login -> 400 invalid password", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 3, email: "x@y.com", password_hash: "hash", is_admin: false },
      ],
    });
    const bcryptMod = require("bcrypt");
    bcryptMod.compare.mockResolvedValueOnce(false);

    const app = makeApp();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@y.com", password: "bad" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid");
  });

  test("login -> 200 success", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 3, email: "x@y.com", password_hash: "hash", is_admin: true },
      ],
    });
    const app = makeApp();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@y.com", password: "good" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe("token");
    expect(res.body.user).toMatchObject({
      id: 3,
      email: "x@y.com",
      is_admin: true,
    });
  });
});
