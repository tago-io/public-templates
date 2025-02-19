import { z } from "zod";
import { zName, zResourceID } from "./utils/common";

const zAnalysisField = z.object({
  name: z.string(),
  description: z.string(),
});

const zDevicesField = z.object({
  name: z.string(),
  description: z.string(),
});

const zBlueprintsField = z.object({
  name: z.string(),
  description: z.string(),
  conditions: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  filter_conditions: z
    .array(
      z.object({
        type: z.string(),
        tag_key: z.string(),
        blueprint_device: z.string(),
      })
    )
    .nullish(),
});

const zSetup = z
  .object({
    analysis: z.array(zAnalysisField).optional(),
    devices: z.array(zDevicesField).optional(),
    blueprints: z.array(zBlueprintsField).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.devices && data.blueprints) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "setup cannot have both 'devices' and 'blueprints'.",
        path: ["setup"],
      });
    }
  });

const zTemplatePublic = z
  .object({
    id: zResourceID,
    name: zName,
    type: z.enum(["dashboard_standard", "dashboard_blueprint"]),
    description: z.string(),
    logo: z.string().nullish(),
    banner: z.string().nullish(),
    setup: zSetup,
    use_mock: z.boolean().default(false),
    structure: z.instanceof(Buffer).refine((value) => {
      if (!value) {
        return false;
      }

      const size = Buffer.byteLength(value, "utf8");

      if (size > 100_000) {
        return false;
      }
      return true;
    }, "structure size is too big, max 100kb"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "dashboard_standard" && (!data.setup.devices || data.setup.blueprints)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "'standard' type must have 'devices' and cannot have 'blueprints'.",
        path: ["setup"],
      });
    }
    if (data.type === "dashboard_blueprint" && (!data.setup.blueprints || data.setup.devices)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "'blueprint' type must have 'blueprints' and cannot have 'devices'.",
        path: ["setup"],
      });
    }
  });

type TemplatePublic = z.infer<typeof zTemplatePublic>;

export { zTemplatePublic };

export type { TemplatePublic };
