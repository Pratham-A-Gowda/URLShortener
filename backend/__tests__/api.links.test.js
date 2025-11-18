const express = require("express");
const request = require("supertest");

jest.mock("../db", () => ({ query: jest.fn() }));
jest.mock("../middlewares/auth", () => (req, _res, next) => {
  req.user = { id: 123 };
  next();
});

const db = require("../db");
const apiRouter = require("../routes/api");

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", apiRouter);
  return app;
}

describe("API links + analytics + delete", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/links returns links with click counts", async () => {
    // First call: select links for user
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          alias: "a1",
          long_url: "https://a.com",
          has_qr: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          alias: "a2",
          long_url: "https://b.com",
          has_qr: true,
          created_at: new Date().toISOString(),
        },
      ],
    });
    // Next calls: count clicks for each id
    db.query
      .mockResolvedValueOnce({ rows: [{ count: "5" }] })
      .mockResolvedValueOnce({ rows: [{ count: "0" }] });

    const app = makeApp();
    const res = await request(app)
      .get("/api/links")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
    expect(res.body.links).toHaveLength(2);
    const [l1, l2] = res.body.links;
    expect(l1).toMatchObject({ id: 1, alias: "a1", clicks: 5 });
    expect(l2).toMatchObject({ id: 2, alias: "a2", clicks: 0 });
  });

  test("GET /api/links/:id/analytics -> 404 when not owned", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const app = makeApp();
    const res = await request(app)
      .get("/api/links/99/analytics")
      .set("Authorization", "Bearer token");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });

  test("GET /api/links/:id/analytics -> 200 returns recent clicks", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 10, alias: "abc" }] }) // ownership check
      .mockResolvedValueOnce({
        rows: [
          {
            ts: new Date().toISOString(),
            referrer: "https://ref",
            ua: "jest",
            ip: "127.0.0.1",
          },
        ],
      });

    const app = makeApp();
    const res = await request(app)
      .get("/api/links/10/analytics")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.clicks)).toBe(true);
    expect(res.body.clicks[0]).toHaveProperty("ua", "jest");
  });

  test("DELETE /api/links/:id -> 404 when not found", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const app = makeApp();
    const res = await request(app)
      .delete("/api/links/7")
      .set("Authorization", "Bearer token")
      .send({ alias: "x" });
    expect(res.status).toBe(404);
  });

  test("DELETE /api/links/:id -> 400 when alias mismatch", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ alias: "real" }] });
    const app = makeApp();
    const res = await request(app)
      .delete("/api/links/7")
      .set("Authorization", "Bearer token")
      .send({ alias: "wrong" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Alias does not match");
  });

  test("DELETE /api/links/:id -> 200 success", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ alias: "good" }] }) // select
      .mockResolvedValueOnce({ rows: [] }); // delete

    const app = makeApp();
    const res = await request(app)
      .delete("/api/links/7")
      .set("Authorization", "Bearer token")
      .send({ alias: "good" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
