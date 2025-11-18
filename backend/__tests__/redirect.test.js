const express = require("express");
const request = require("supertest");

jest.mock("../db", () => ({ query: jest.fn() }));
const db = require("../db");
const redirectRouter = require("../routes/redirect");

function makeApp() {
  const app = express();
  app.set("trust proxy", true);
  app.use("/r", redirectRouter);
  return app;
}

describe("GET /r/:alias", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 when alias not found", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const app = makeApp();
    const res = await request(app).get("/r/missing");
    expect(res.status).toBe(404);
    expect(res.text).toBe("Not found");
    expect(db.query).toHaveBeenCalledWith(
      "SELECT id,long_url FROM links WHERE alias=$1",
      ["missing"]
    );
  });

  test("302 redirect when alias exists and click is recorded", async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, long_url: "https://example.com" }],
      }) // select link
      .mockResolvedValueOnce({ rows: [] }); // insert click

    const app = makeApp();
    const res = await request(app)
      .get("/r/exists")
      .set("User-Agent", "jest")
      .set("Referer", "https://ref");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://example.com");
    expect(db.query).toHaveBeenNthCalledWith(
      1,
      "SELECT id,long_url FROM links WHERE alias=$1",
      ["exists"]
    );
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      "INSERT INTO clicks (link_id,referrer,ua,ip) VALUES ($1,$2,$3,$4)",
      [1, "https://ref", "jest", expect.any(String)]
    );
  });
});
