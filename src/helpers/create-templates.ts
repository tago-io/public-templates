import path from "node:path";
import fs from "node:fs";
import type { Knex } from "knex";
import { generateID } from "../helpers/generate-id";
import { readFileFromPath } from "../helpers/read-file-from-path";
import { generateAssetURL } from "./create-asset-url";
import type { DashboardTemplateConfig, DashboardTemplateManifest } from "../schema/types";
import { zTemplatePublic } from "../validator/template-public";

async function createTemplate(knexClient: Knex, templateData: DashboardTemplateManifest, filePath: string) {
  const manifestKeys = Object.keys(templateData?.manifest || {});

  for (const element of manifestKeys) {
    const validateType = element === "standard" ? "standard" : "blueprint";

    const detailsPath = path.join(filePath, templateData.manifest?.[validateType] as string);

    if (!fs.existsSync(detailsPath)) {
      throw `file manifest-config.jsonc not found in ${filePath}/${validateType}`;
    }

    const configData: DashboardTemplateConfig = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

    const data = {
      id: generateID(templateData.name, configData.type),
      name: templateData.name,
      structure: await readFileFromPath(filePath, templateData.structure?.[validateType], true),
      description: await readFileFromPath(filePath, templateData.description),
      logo: generateAssetURL(filePath, templateData?.images?.logo),
      banner: generateAssetURL(filePath, templateData?.images?.banner),
      setup: configData.setup,
      type: `dashboard_${configData.type}`,
      use_mock: configData.use_mock,
    };

    const model = await zTemplatePublic.parseAsync(data);

    await knexClient.insert(model).into("public_template");
  }
}

async function createTemplates(knexClient: Knex, directoryPath: string): Promise<void> {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    if (!fs.lstatSync(filePath).isDirectory()) {
      throw `${file} is not a valid directory`;
    }
    const manifestPath = path.join(filePath, "manifest.jsonc");
    if (!fs.existsSync(manifestPath)) {
      throw `manifest.jsonc manifest file not found in ${filePath}`;
    }
    const templateData: DashboardTemplateManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    await createTemplate(knexClient, templateData, filePath);
  }
}

export { createTemplates };
