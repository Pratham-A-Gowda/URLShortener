const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middlewares/auth");
const { nanoid } = require("../utils/nanoid");
const { body, validationResult } = require("express-validator");

router.post("/shorten", auth, body("longUrl").isURL(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  let { longUrl, alias, hasQR } = req.body;
  if (alias) alias = alias.trim();
  if (alias) {
    const t = await db.query("SELECT id FROM links WHERE alias=$1", [alias]);
    if (t.rows.length) return res.status(400).json({ error: "Alias taken" });
  } else {
    alias = nanoid(8);
  }
  const r = await db.query(
    "INSERT INTO links (alias,long_url,owner_id,has_qr) VALUES ($1,$2,$3,$4) RETURNING id,alias,long_url,has_qr,created_at",
    [alias, longUrl, req.user.id, hasQR || false]
  );
  res.json({ link: r.rows[0] });
});

router.get("/links", auth, async (req, res) => {
  const r = await db.query(
    "SELECT id,alias,long_url,has_qr,created_at FROM links WHERE owner_id=$1 ORDER BY created_at DESC",
    [req.user.id]
  );
  const links = await Promise.all(
    r.rows.map(async (l) => {
      const c = await db.query("SELECT count(*) FROM clicks WHERE link_id=$1", [
        l.id,
      ]);
      l.clicks = parseInt(c.rows[0].count, 10);
      return l;
    })
  );
  res.json({ links });
});

router.get("/links/:id/analytics", auth, async (req, res) => {
  const id = req.params.id;
  const r0 = await db.query(
    "SELECT id,alias FROM links WHERE id=$1 AND owner_id=$2",
    [id, req.user.id]
  );
  if (!r0.rows.length) return res.status(404).json({ error: "Not found" });
  const clicks = (
    await db.query(
      "SELECT ts,referrer,ua,ip FROM clicks WHERE link_id=$1 ORDER BY ts DESC LIMIT 1000",
      [id]
    )
  ).rows;
  res.json({ clicks });
});

router.delete("/links/:id", auth, async (req, res) => {
  const id = req.params.id;
  const { alias } = req.body;
  const r = await db.query(
    "SELECT alias FROM links WHERE id=$1 AND owner_id=$2",
    [id, req.user.id]
  );
  if (!r.rows.length) return res.status(404).json({ error: "Not found" });
  if (r.rows[0].alias !== alias)
    return res.status(400).json({ error: "Alias does not match" });
  await db.query("DELETE FROM links WHERE id=$1", [id]);
  res.json({ success: true });
});

module.exports = router;
