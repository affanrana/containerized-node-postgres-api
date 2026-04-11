// scripts/migrate.js
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function getMigrationsDir() {
  // expected: /app/migrations in Docker, ./migrations locally
  return path.join(process.cwd(), "migrations");
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function hasMigration(client, id) {
  const res = await client.query(
    "SELECT 1 FROM schema_migrations WHERE id = $1 LIMIT 1;",
    [id]
  );
  return res.rowCount > 0;
}

async function applyMigration(client, id, sql) {
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (id) VALUES ($1);", [id]);
    await client.query("COMMIT");
    console.log(`✅ Applied migration: ${id}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`❌ Failed migration: ${id}`);
    throw err;
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required (env var).");
    process.exit(1);
  }

  const migrationsDir = getMigrationsDir();
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new Client({ connectionString: databaseUrl });

  // simple retry loop for container startup timing
  const maxAttempts = 20;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await client.connect();
      break;
    } catch (e) {
      if (attempt === maxAttempts) throw e;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  try {
    await ensureMigrationsTable(client);

    for (const file of files) {
      const id = file;
      const already = await hasMigration(client, id);
      if (already) {
        console.log(`↩️  Skipping migration (already applied): ${id}`);
        continue;
      }

      const fullPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullPath, "utf8");
      await applyMigration(client, id, sql);
    }

    console.log("🎉 Migrations complete.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
