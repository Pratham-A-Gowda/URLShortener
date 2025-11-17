const db = require("./db");

async function migrate() {
  try {
    console.log("Adding has_qr column to links table...");
    await db.query(
      "ALTER TABLE links ADD COLUMN IF NOT EXISTS has_qr BOOLEAN DEFAULT false"
    );
    console.log("✓ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
