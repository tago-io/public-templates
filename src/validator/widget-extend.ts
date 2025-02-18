import { z } from "zod";
import { zTagsWithMetadata, zResourceID } from "./utils/common.ts";
import { VARIABLE_EXP } from "./data.ts";

const resource_regex = /(tags|param)+.*/;

const zWidgetResourceBase = z.object({
  filter: zTagsWithMetadata,
});

/**
 * Device Resource
 */
const device_fields = z.enum([
  "id",
  "name",
  "last_input",
  "created_at",
  "active",
  "bucket_name",
  "connector_name",
  "network_name",
]);
const device_resource_regex = z.string().regex(resource_regex, { message: "Invalid parameter." });
const zWidgetResourceDevice = zWidgetResourceBase.extend({
  amount: z.number().max(10_000).optional().default(1000),
  type: z.literal("device"),
  orderBy: z.string().optional().default("created_at,asc"),
  view: z.union([device_fields, device_resource_regex]).array().optional().default([]),
  editable: z
    .union([z.literal("name"), device_resource_regex])
    .array()
    .optional()
    .default([]),
});

const user_fields = z.enum([
  "id",
  "name",
  "email",
  "phone",
  "company",
  "created_at",
  "active",
  "timezone",
  "language",
  "password",
  "last_login",
]);
/**
 * User Resource
 */
const user_resource_regex = z.string().regex(/tags+.*/, { message: "Invalid parameter." });
const zWidgetResourceUser = zWidgetResourceBase.extend({
  amount: z.number().max(10_000).optional().default(1000),
  type: z.literal("user"),
  orderBy: z.string().optional().default("created_at,asc"),
  view: z.union([user_fields, user_resource_regex]).array().optional().default([]),
  editable: z.union([user_fields, user_resource_regex]).array().optional().default([]),
});

/**
 * Entity Resource
 */
const zWidgetResourceEntity = z.object({
  amount: z.number().max(10_000).optional().default(1000),
  type: z.literal("entity"),
  index: z.string().optional(),
  id: z.string(),
  filter: z
    .record(z.union([z.string(), z.number()]))
    .optional()
    .nullable(),
  orderBy: z.enum(["asc", "desc"]).optional().default("desc"),
  view: z.string().array().optional().default([]),
  editable: z.string().array().optional().default([]),
});

const zWidgetResource = z.discriminatedUnion("type", [
  zWidgetResourceDevice,
  zWidgetResourceUser,
  zWidgetResourceEntity,
]);

function checkVariables(variables: string[]) {
  try {
    variables.map((x: string) => {
      const lower = x.toLowerCase();
      if (!VARIABLE_EXP.test(lower)) {
        throw 1;
      }
      return lower;
    });
  } catch {
    return false;
  }
  return true;
}

const AGGREGATE_FUNCTIONS = new Set(["sum", "avg", "min", "max"]);
const CONDITIONAL_FUNCTIONS = new Set(["gt", "gte", "lt", "lte", "eq", "ne"]);

const zWidgetData = z
  .object({
    origin: zResourceID.optional(),
    qty: z.number().optional(),
    timezone: z.string().optional(),
    variables: z
      .array(z.string())
      .refine(checkVariables, { message: "Invalid variable name" })
      .optional(),
    bucket: zResourceID.optional(),
    query: z.string().optional(),
    function: z.enum(["sum", "avg", "min", "max", "gt", "gte", "lt", "lte", "eq", "ne"]).optional(),
    interval: z.enum(["minute", "hour", "day", "week", "month", "quarter", "year"]).optional(),
    value: z.number().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    overwrite: z.boolean().optional(),
    page: z.number().optional(),
    is_hide: z.boolean().optional(),
    is_global_time_data: z.boolean().optional(),
    entity: zResourceID.optional(),
  })
  .refine(
    (data) => {
      if (data.query && data.query === "aggregate" && !AGGREGATE_FUNCTIONS.has(data?.function || "")) {
        return false;
      }

      if (data.query && data.query === "conditional" && !CONDITIONAL_FUNCTIONS.has(data?.function || "")) {
        return false;
      }

      return true;
    },
    { message: "invalid function name" }
  );

type WidgetResource = z.infer<typeof zWidgetResource>;
type WidgetData = z.infer<typeof zWidgetData>;
type WidgetResourceEntity = z.infer<typeof zWidgetResourceEntity>;
type WidgetResourceDevice = z.infer<typeof zWidgetResourceDevice>;
type WidgetResourceUser = z.infer<typeof zWidgetResourceUser>;

export { zWidgetData, zWidgetResource, resource_regex };
export type {
  WidgetData,
  WidgetResource,
  WidgetResourceEntity,
  WidgetResourceDevice,
  WidgetResourceUser,
};
