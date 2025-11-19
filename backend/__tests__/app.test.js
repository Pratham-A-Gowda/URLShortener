const request = require("supertest");
jest.mock("../db");
const db = require("../db");
const app = require("../app");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function authHeader(token) {
  return { Authorization: "Bearer " + token };
}

describe("App integration tests", () => {
  let token;
  beforeEach(() => {
    db.reset();
  });

  test("GET / root ok", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("Register success", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@test.com", password: "pass1234" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  test("Register duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "x@test.com", password: "p" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "x@test.com", password: "p" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Email exists/);
  });

  test("Login invalid user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "no@test.com", password: "p" });
    expect(res.status).toBe(400);
  });

  test("Login success after register", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "login@test.com", password: "p123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "p123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test("Shorten requires auth", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ longUrl: "https://example.com" });
    expect(res.status).toBe(401);
  });

  test("Shorten success and list links", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "l@test.com", password: "pw" });
    const t = reg.body.token;
    const create = await request(app)
      .post("/api/shorten")
      .set(authHeader(t))
      .send({ longUrl: "https://example.com" });
    expect(create.status).toBe(200);
    expect(create.body.link.alias).toBeTruthy();
    const list = await request(app).get("/api/links").set(authHeader(t));
    expect(list.status).toBe(200);
    expect(list.body.links.length).toBe(1);
    expect(list.body.links[0].clicks).toBe(0);
  });

  test("Analytics not found for missing link", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "ana@test.com", password: "pw" });
    const t = reg.body.token;
    const res = await request(app)
      .get("/api/links/999/analytics")
      .set(authHeader(t));
    expect(res.status).toBe(404);
  });

  test("Delete link mismatch alias", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "d@test.com", password: "pw" });
    const t = reg.body.token;
    const create = await request(app)
      .post("/api/shorten")
      .set(authHeader(t))
      .send({ longUrl: "https://example.com", alias: "myalias" });
    const id = create.body.link.id;
    const del = await request(app)
      .delete("/api/links/" + id)
      .set(authHeader(t))
      .send({ alias: "wrong" });
    expect(del.status).toBe(400);
  });

  test("Delete link success", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "del@test.com", password: "pw" });
    const t = reg.body.token;
    const create = await request(app)
      .post("/api/shorten")
      .set(authHeader(t))
      .send({ longUrl: "https://example.com" });
    const id = create.body.link.id;
    const alias = create.body.link.alias;
    const del = await request(app)
      .delete("/api/links/" + id)
      .set(authHeader(t))
      .send({ alias });
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);
  });

  test("Redirect logs click", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "r@test.com", password: "pw" });
    const t = reg.body.token;
    const create = await request(app)
      .post("/api/shorten")
      .set(authHeader(t))
      .send({ longUrl: "https://example.com/page" });
    const alias = create.body.link.alias;
    const res = await request(app)
      .get("/r/" + alias)
      .redirects(0);
    expect(res.status).toBe(302);
  });

  test("Admin users listing forbidden for non-admin", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "u@test.com", password: "pw" });
    const t = reg.body.token;
    const res = await request(app).get("/api/admin/users").set(authHeader(t));
    expect(res.status).toBe(403);
  });

  test("Admin promote/demote flow", async () => {
    // create admin directly via db mock
    const hash = await bcrypt.hash("pw", 10);
    await db.query(
      "INSERT INTO users (email,password_hash,is_admin) VALUES ($1,$2,$3) RETURNING id,email,is_admin",
      ["admin@test.com", hash, true]
    );
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "pw" });
    const at = login.body.token;
    // create normal user
    const uReg = await request(app)
      .post("/api/auth/register")
      .send({ email: "normal@test.com", password: "pw" });
    const usersBefore = await request(app)
      .get("/api/admin/users")
      .set(authHeader(at));
    expect(usersBefore.status).toBe(200);
    const targetId = usersBefore.body.users.find(
      (u) => u.email === "normal@test.com"
    ).id;
    const promote = await request(app)
      .post("/api/admin/users/" + targetId + "/promote")
      .set(authHeader(at));
    expect(promote.status).toBe(200);
    const demote = await request(app)
      .post("/api/admin/users/" + targetId + "/demote")
      .set(authHeader(at));
    expect(demote.status).toBe(200);
    const del = await request(app)
      .delete("/api/admin/users/" + targetId)
      .set(authHeader(at));
    expect(del.status).toBe(200);
  });

  test("Shorten invalid URL fails validation", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "val@test.com", password: "pw" });
    const t = reg.body.token;
    const res = await request(app)
      .post("/api/shorten")
      .set(authHeader(t))
      .send({ longUrl: "not-a-url" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeTruthy();
  });

  test("Register missing fields returns 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "", password: "" });
    expect(res.status).toBe(400);
  });

  test("Redirect 404 for missing alias", async () => {
    const res = await request(app).get("/r/doesnotexist").redirects(0);
    expect(res.status).toBe(404);
  });

  test("Admin invalid token returns 401", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set({ Authorization: "Bearer invalidtoken" });
    expect(res.status).toBe(401);
  });

  test("Auth middleware: invalid token returns 401", async () => {
    const res = await request(app)
      .get("/api/links")
      .set({ Authorization: "Bearer invalid" });
    expect(res.status).toBe(401);
  });

  test("Auth middleware: user not found returns 401", async () => {
    const tok = jwt.sign(
      { sub: 999, is_admin: false },
      process.env.JWT_SECRET || "secret"
    );
    const res = await request(app).get("/api/links").set(authHeader(tok));
    expect(res.status).toBe(401);
  });

  test("Login wrong password returns 400", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "wp@test.com", password: "correct" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wp@test.com", password: "wrong" });
    expect(res.status).toBe(400);
  });

  test("Shorten with taken alias returns 400", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@test.com", password: "pw" });
    const t = reg.body.token;
    await request(app)
      .post("/api/shorten")
      .set(authHeader(t))
      .send({ longUrl: "https://example.com", alias: "dup" });
    const res = await request(app)
      .post("/api/shorten")
      .set(authHeader(t))
      .send({ longUrl: "https://example.com/2", alias: "dup" });
    expect(res.status).toBe(400);
  });

  test("Delete link not found returns 404", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "nf@test.com", password: "pw" });
    const t = reg.body.token;
    const res = await request(app)
      .delete("/api/links/999")
      .set(authHeader(t))
      .send({ alias: "whatever" });
    expect(res.status).toBe(404);
  });

  test("Analytics returns clicks after redirect", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "ana2@test.com", password: "pw" });
    const t = reg.body.token;
    const create = await request(app)
      .post("/api/shorten")
      .set(authHeader(t))
      .send({ longUrl: "https://example.com/a" });
    const id = create.body.link.id;
    const alias = create.body.link.alias;
    await request(app)
      .get("/r/" + alias)
      .set({ Referer: "https://ref.example", "User-Agent": "Jest" })
      .redirects(0);
    const res = await request(app)
      .get("/api/links/" + id + "/analytics")
      .set(authHeader(t));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.clicks)).toBe(true);
    expect(res.body.clicks.length).toBeGreaterThanOrEqual(1);
  });

  test("Admin no token returns 401", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });
});
