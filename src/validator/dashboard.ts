import { z } from "zod";
import { generateID, zDateAutoGen, zName, zResourceID, zResourceIDAutoGen, zTagsWithMetadata } from "./utils/common.ts";

const zArrangement = z.object({
  widget_id: zResourceID,
  height: z.number(),
  width: z.number(),
  x: z.number(),
  y: z.number(),
  tab: z.string().nullish(),
});

const zConditions = z
  .array(
    z
      .object({
        resource: z.enum(["user", "device"]).default("user"),
        key: z.string(),
        value: z.string(),
        resourceId: zResourceID.optional(),
      })
      .refine(
        (obj) => {
          if (obj.resource === "user" && obj.resourceId) {
            return false;
          }
          return true;
        },
        { message: "only resource 'device' can have resourceId" }
      )
  )
  .optional();

const zTabs = z
  .array(
    z.object({
      key: z.string().optional(),
      value: z.string().optional(),
      link: z.string().nullish().optional(),
      type: z.string().nullish().optional(),
      hidden: z.boolean().nullish().optional(),
      conditions: zConditions,
    })
  )
  .refine(
    (tabs) => {
      const dups = tabs.map((x) => x.key).filter((i, pos, self) => self.indexOf(i) !== pos);
      if (dups) {
        return true;
      }
    },
    { message: "You can't have the same key twice for 'tabs'" }
  );

const TPeriodSchema = z.object({
  type: z.string(),
  amount: z.number().optional(),
  absolute: z.string().optional(),
  default: z.boolean().optional(),
});

const zDashboardFilter = z.object({
  period: z
    .object({
      enabled: z.boolean().optional(),
      presets: z.array(TPeriodSchema).optional(),
      show_calendar: z.boolean().optional(),
      max_range: z.string().optional(),
    })
    .optional(),
});

const zDashboard = z.object({
  id: zResourceID,
  label: zName,
  visible: z.boolean().default(true),
  type: z.enum(["dashboard", "blueprint"]).default("dashboard"),
  tags: zTagsWithMetadata.optional(),
  tabs: zTabs
    .nullish()
    .transform((v) => (v ? v : []))
    .default([]),
  arrangement: z.array(zArrangement).nullish().optional(),
  description: z.string().nullish().optional(),
  last_access: z.string().nullish().optional(),
  icon: z.object({}).passthrough().nullish().optional(),
  setup: z.object({}).passthrough().nullish().optional(),
  theme: z.object({}).passthrough().nullish().optional(),
  background: z.object({}).passthrough().nullish().optional(),
  group_by: z.array(z.string()).nullish().optional(),
  blueprint_devices: z
    .array(
      z
        .object({
          id: zResourceID.nullish(),
          type: z.enum(["device", "entity"]).default("device"),
          name: z.string().nullish(),
          filter_conditions: z.array(z.any()).nullish(),
          label: z.any().nullish(),
          conditions: z.array(z.any()).nullish(),
          placeholder: z.string().nullish(),
          tag_to_replace: z.string().nullish(),
          description: z.string().nullish(),
          use_item_label_tag: z.boolean().nullish(),
          hide_when_empty: z.boolean().nullish(),
        })
        .transform((v) => {
          if (!v?.id) {
            v.id = generateID();
          }
          return v;
        })
    )
    .nullish()
    .optional(),
  blueprint_device_behavior: z.string().nullish().optional(),
  blueprint_selector_behavior: z.string().nullish().optional(),
  disable_blueprint_fallback: z.boolean().default(false),
  filter: zDashboardFilter.nullish(),
  created_at: z.date(),
  updated_at: z.date(),
});

const zDashboardCreate = zDashboard
  .extend({
    id: zResourceIDAutoGen,
    visible: zDashboard.shape.visible.default(true),
    type: zDashboard.shape.type.default("dashboard"),
    created_at: zDateAutoGen,
    updated_at: zDateAutoGen,
  })
  .omit({ last_access: true });

type Dashboard = z.infer<typeof zDashboard>;
type DashboardCreate = z.infer<typeof zDashboardCreate>;

export { zDashboard, zDashboardCreate };
export type { Dashboard, DashboardCreate };
