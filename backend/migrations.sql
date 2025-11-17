CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias TEXT UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  has_qr BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  referrer TEXT,
  ua TEXT,
  ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_links_owner ON links(owner_id);
CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks(link_id);
