import path from "node:path";
import fs from "node:fs";
import nodeUrl from "node:url";
import knex, { type Knex } from "knex";
import { createTemplates } from "../helpers/create-templates";

const __filename = nodeUrl.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let knexClient: Knex;

const migrationConfig: Knex.MigratorConfig = {
  tableName: "migrations",
  directory: path.join("src/database"),
  // Fixes the error: The migration directory is corrupt, the following files are missing
  disableMigrationsListValidation: true,
};

async function digestTemplate(knexClient: Knex): Promise<void> {
  try {
    await createTemplates(knexClient, path.join(__dirname, "../../templates/dashboard"));

    console.info("Database is ready! 🚀🔥");
  } catch (error) {
    console.error("Error on generating database:", error);
    process.exit(1);
  }
}

async function generateDatabase(data: { file: string; directory: string }): Promise<void> {
  fs.mkdirSync(data.directory, { recursive: true });

  const dbPath = path.join(data.directory, data.file);

  // Delete the .db file if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`Deleted existing database file at ${dbPath}`);
  }

  knexClient = knex({
    client: "better-sqlite3",
    connection: { filename: dbPath },
    useNullAsDefault: true,
  });

  knexClient.schema.createSchemaIfNotExists("templates");

  await knexClient.migrate.latest(migrationConfig);

  await digestTemplate(knexClient);

  await knexClient.destroy();
}

generateDatabase({ directory: "data", file: "templates.db" }).catch((error) => console.error(error));
