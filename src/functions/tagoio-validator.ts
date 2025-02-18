import * as fs from "node:fs";
import * as path from "node:path";
import * as nodeUrl from "node:url";
import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import dashboardTemplateSchema from "../schema/dashboard-template.json" assert { type: "json" };
import dashboardTemplateConfigSchema from "../schema/dashboard-template-config.json" assert { type: "json" };
import type { DashboardTemplateConfig, DashboardTemplateManifest } from "../schema/types";
import { zDashboardStructure } from "../validator/dashboard-structure";

const __filename = nodeUrl.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVerbose = process.argv[2] === "--verbose";

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: "failing",
  strict: false,
});
addFormats(ajv);

// Compile Dashboard template schemas
const validateDashTemplate = ajv.compile(dashboardTemplateSchema);
const validateDashTemplateConfig = ajv.compile(dashboardTemplateConfigSchema);

function validateTemplateConfig(
  templateData: DashboardTemplateManifest,
  filePath: string
) {
  const manifestKeys = Object.keys(templateData?.manifest || {});

  for (const element of manifestKeys) {
    const validateType = element === "standard" ? "standard" : "blueprint";
    const detailsPath = path.join(
      filePath,
      templateData.manifest?.[validateType] as string
    );

    if (!fs.existsSync(detailsPath)) {
      throw `file manifest-config.jsonc not found in ${filePath}/${validateType}`;
    }

    if (
      !fs.existsSync(
        path.join(filePath, templateData.structure?.[validateType] as string)
      )
    ) {
      throw `file structure.json not found in ${filePath}/${validateType}`;
    }

    const configData: DashboardTemplateConfig = JSON.parse(
      fs.readFileSync(detailsPath, "utf8")
    );
    if (configData.type !== validateType) {
      throw `field 'type' does not match in ${detailsPath}. Should be ${validateType}`;
    }

    const isConfigValid = validateDashTemplateConfig(configData); // GPT: issue is happening here
    if (!isConfigValid) {
      throw `Validation errors in ${detailsPath}.\n\n${JSON.stringify(
        validateDashTemplateConfig.errors,
        null,
        2
      )}`;
    }

    const isStructureValid = zDashboardStructure.safeParse(
      JSON.parse(
        fs.readFileSync(
          path.join(filePath, templateData.structure?.[validateType] as string),
          "utf8"
        )
      )
    );
    if (!isStructureValid.success) {
      throw `Validation errors in ${detailsPath}.\n\n${JSON.stringify(
        isStructureValid.error,
        null,
        2
      )}`;
    }
  }
}

async function validateTemplateFiles(directoryPath: string): Promise<void> {
  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      if (!fs.lstatSync(filePath).isDirectory()) {
        throw `${file} is not a valid directory`;
      }

      const manifestDir = path.join(filePath, "manifest.jsonc");

      if (!fs.existsSync(manifestDir)) {
        throw `manifest.jsonc manifest file not found in ${filePath}`;
      }

      const dashboardTemplateData: DashboardTemplateManifest = JSON.parse(
        fs.readFileSync(manifestDir, "utf8")
      );

      for (const element of Object.keys(dashboardTemplateData?.manifest || {})) {
        if (!fs.existsSync(path.join(filePath, element))) {
          throw `${filePath} field manifest.${element} requires folder ${element}`;
        }
      }

      for (const element of Object.keys(dashboardTemplateData?.structure || {})) {
        if (!fs.existsSync(path.join(filePath, element))) {
          throw `${filePath} field structure.${element} requires folder ${element}`;
        }
      }

      const isDashTemplateValid = validateDashTemplate(dashboardTemplateData);
      if (!isDashTemplateValid) {
        throw `Validation errors in ${manifestDir}.\n\n${JSON.stringify(
          validateDashTemplate.errors,
          null,
          2
        )}`;
      }

      validateTemplateConfig(dashboardTemplateData, filePath);

      if (isVerbose) {
        console.info("Validated:", filePath);
      }
    }
    console.info("All dashboard templates successfully validated! 🚀");
  } catch (error) {
    console.error("Error processing templates directories:", error);
    process.exit(1);
  }
}

validateTemplateFiles(path.join(__dirname, "../../templates/dashboard")).catch(
  console.error
);
