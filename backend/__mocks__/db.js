// Mocked db module to simulate PostgreSQL queries.
let users = [];
let links = [];
let clicks = [];
let userSeq = 1;
let linkSeq = 1;

function reset() {
  users = [];
  links = [];
  clicks = [];
  userSeq = 1;
  linkSeq = 1;
}

function query(text, params) {
  // Simplified pattern matching for the queries used in code
  if (text.startsWith("SELECT id FROM users WHERE email=")) {
    const email = params[0];
    return {
      rows: users.filter((u) => u.email === email).map((u) => ({ id: u.id })),
    };
  }
  if (text.startsWith("INSERT INTO users")) {
    const [email, password_hash, is_admin] = params;
    const user = {
      id: userSeq++,
      email,
      password_hash,
      is_admin,
      created_at: new Date(),
    };
    users.push(user);
    return {
      rows: [{ id: user.id, email: user.email, is_admin: user.is_admin }],
    };
  }
  if (
    text.startsWith(
      "SELECT id,email,password_hash,is_admin FROM users WHERE email="
    )
  ) {
    const email = params[0];
    return { rows: users.filter((u) => u.email === email) };
  }
  if (text.startsWith("SELECT id,email,is_admin FROM users WHERE id=")) {
    const id = params[0];
    return { rows: users.filter((u) => u.id === id) };
  }
  if (text.startsWith("SELECT id,alias FROM links WHERE id=")) {
    const [id, owner] = params;
    return {
      rows: links
        .filter((l) => l.id == id && l.owner_id == owner)
        .map((l) => ({ id: l.id, alias: l.alias })),
    };
  }
  if (text.startsWith("INSERT INTO links")) {
    const [alias, long_url, owner_id, has_qr] = params;
    const link = {
      id: linkSeq++,
      alias,
      long_url,
      owner_id,
      has_qr,
      created_at: new Date(),
    };
    links.push(link);
    return {
      rows: [
        {
          id: link.id,
          alias: link.alias,
          long_url: link.long_url,
          has_qr: link.has_qr,
          created_at: link.created_at,
        },
      ],
    };
  }
  if (text.startsWith("SELECT id FROM links WHERE alias=")) {
    const a = params[0];
    return {
      rows: links.filter((l) => l.alias === a).map((l) => ({ id: l.id })),
    };
  }
  if (
    text.startsWith(
      "SELECT id,alias,long_url,has_qr,created_at FROM links WHERE owner_id="
    )
  ) {
    const owner = params[0];
    return { rows: links.filter((l) => l.owner_id === owner) };
  }
  if (text.startsWith("SELECT count(*) FROM clicks WHERE link_id=")) {
    const link_id = params[0];
    return {
      rows: [{ count: clicks.filter((c) => c.link_id === link_id).length }],
    };
  }
  if (text.startsWith("SELECT ts,referrer,ua,ip FROM clicks WHERE link_id=")) {
    const link_id = params[0];
    return { rows: clicks.filter((c) => c.link_id == link_id) };
  }
  if (text.startsWith("INSERT INTO clicks")) {
    const [link_id, referrer, ua, ip] = params;
    clicks.push({ link_id, referrer, ua, ip, ts: new Date() });
    return { rows: [] };
  }
  if (text.startsWith("DELETE FROM links WHERE id=")) {
    const id = params[0];
    links = links.filter((l) => l.id !== id);
    return { rows: [] };
  }
  if (
    text.startsWith(
      "SELECT id,email,is_admin,created_at FROM users ORDER BY created_at DESC"
    )
  ) {
    return {
      rows: users
        .sort((a, b) => b.created_at - a.created_at)
        .map((u) => ({
          id: u.id,
          email: u.email,
          is_admin: u.is_admin,
          created_at: u.created_at,
        })),
    };
  }
  if (text.startsWith("UPDATE users SET is_admin = true WHERE id=")) {
    const id = params[0];
    users = users.map((u) =>
      u.id === parseInt(id) ? { ...u, is_admin: true } : u
    );
    return { rows: [] };
  }
  if (text.startsWith("UPDATE users SET is_admin = false WHERE id=")) {
    const id = params[0];
    users = users.map((u) =>
      u.id === parseInt(id) ? { ...u, is_admin: false } : u
    );
    return { rows: [] };
  }
  if (text.startsWith("DELETE FROM users WHERE id=")) {
    const id = params[0];
    users = users.filter((u) => u.id !== parseInt(id));
    return { rows: [] };
  }
  if (text.startsWith("SELECT alias FROM links WHERE id=")) {
    const [id, owner] = params;
    return {
      rows: links
        .filter((l) => l.id == id && l.owner_id == owner)
        .map((l) => ({ alias: l.alias })),
    };
  }
  if (text.startsWith("SELECT id,long_url FROM links WHERE alias=")) {
    const alias = params[0];
    return {
      rows: links
        .filter((l) => l.alias === alias)
        .map((l) => ({ id: l.id, long_url: l.long_url })),
    };
  }
  console.warn("Unmatched query", text);
  return { rows: [] };
}

module.exports = { query, reset };
