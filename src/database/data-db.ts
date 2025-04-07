import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("public_template"))) {
    await knex.schema.createTable("public_template", (table) => {
      table.text("id").primary();
      table.text("name").notNullable();
      table.text("type").notNullable();
      table.text("category").notNullable();
      table.text("description").defaultTo(null);
      table.boolean("use_mock").defaultTo(false);
      table.binary("structure").notNullable();
      table.text("setup").notNullable();
      table.text("logo");
      table.text("banner");

      // creating indexes
      table.unique(["id"], {
        indexName: "public_template_pkey",
        storageEngineIndexType: "btree",
      });
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("public_template")) {
    await knex.schema.dropTable("public_template");
  }
}
