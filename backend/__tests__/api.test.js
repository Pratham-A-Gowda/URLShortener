const express = require("express");
const request = require("supertest");

jest.mock("../db", () => ({ query: jest.fn() }));
jest.mock("../middlewares/auth", () => (req, _res, next) => {
  req.user = { id: 123 };
  next();
});
jest.mock("../utils/nanoid", () => ({ nanoid: () => "fixedid" }));

const db = require("../db");
const apiRouter = require("../routes/api");

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", apiRouter);
  return app;
}

describe("POST /api/shorten", () => {
  beforeEach(() => jest.clearAllMocks());

  test("400 for invalid URL", async () => {
    const app = makeApp();
    const res = await request(app)
      .post("/api/shorten")
      .set("Authorization", "Bearer token")
      .send({ longUrl: "not-a-url" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("400 when alias is already taken", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // alias exists
    const app = makeApp();
    const res = await request(app)
      .post("/api/shorten")
      .set("Authorization", "Bearer token")
      .send({ longUrl: "https://valid.com", alias: "taken" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Alias taken");
    expect(db.query).toHaveBeenCalledWith(
      "SELECT id FROM links WHERE alias=$1",
      ["taken"]
    );
  });

  test("201-like success (200) when created with generated alias", async () => {
    // No alias provided -> uses nanoid('fixedid') and inserts
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 10,
          alias: "fixedid",
          long_url: "https://valid.com",
          has_qr: false,
          created_at: new Date().toISOString(),
        },
      ],
    });
    const app = makeApp();
    const res = await request(app)
      .post("/api/shorten")
      .set("Authorization", "Bearer token")
      .send({ longUrl: "https://valid.com" });

    expect(res.status).toBe(200);
    expect(res.body.link).toMatchObject({
      id: 10,
      alias: "fixedid",
      long_url: "https://valid.com",
    });
    expect(db.query).toHaveBeenCalledWith(
      "INSERT INTO links (alias,long_url,owner_id,has_qr) VALUES ($1,$2,$3,$4) RETURNING id,alias,long_url,has_qr,created_at",
      ["fixedid", "https://valid.com", 123, false]
    );
  });
});
