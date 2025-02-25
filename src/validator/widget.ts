import { z } from "zod";
import { DateTime } from "luxon";
import { zResourceID, zResourceIDAutoGen, zDateAutoGen, parseRelativeDate, generateID } from "./utils/common.ts";
import { zWidgetData, zWidgetResource } from "./widget-extend.ts";

const ONE_MINUTE_IN_SECONDS = 30;
const FIFTEEN_MINUTES_IN_SECONDS = 1_296_000;

function checkExpirationTime(value: string): boolean {
  const now = new Date();

  const expireDate = parseRelativeDate(value, "plus", now) as Date;

  const expireInSeconds = DateTime.fromJSDate(expireDate).toSeconds() - DateTime.fromJSDate(now).toSeconds();

  if (expireInSeconds < ONE_MINUTE_IN_SECONDS) {
    return false;
  }

  if (expireInSeconds > FIFTEEN_MINUTES_IN_SECONDS) {
    return false;
  }

  return true;
}

const expirationTimeSchema = z
  .string()
  .refine(
    (value) => {
      const regex = /^\d+\s(second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months)$/;
      return regex.test(value);
    },
    {
      message: "Invalid expiration time format. Use formats like '1 day', '2 hours', '1 week'', etc.",
    }
  )
  .refine(checkExpirationTime, {
    message: "The duration must be between 1 minute and 15 days.",
  });

const zWidget = z.object({
  id: zResourceID,
  label: z.string().max(100),
  dashboard: zResourceID.optional(),
  type: z.string(),
  display: z.record(z.any()),
  cache: z
    .object({
      expiration: expirationTimeSchema,
    })
    .nullish(),
  data: z.array(zWidgetData).optional().nullable(),
  resource: z.array(zWidgetResource).optional(),
  analysis_run: z
    .union([z.literal(""), zResourceID])
    .optional()
    .nullable(),
  realtime: z.union([z.string(), z.boolean()]).optional().nullable(),
  mock_data: z.string().nullish(),
  created_at: z.date(),
  updated_at: z.date(),
});

const zWidgetCreate = zWidget.extend({
  data: zWidget.shape.data.default([]),
  resource: zWidget.shape.resource.default([]),
  realtime: zWidget.shape.realtime.default("true"),
  created_at: zDateAutoGen,
  updated_at: zDateAutoGen,
});

type Widget = z.infer<typeof zWidget>;
type WidgetCreate = z.infer<typeof zWidgetCreate>;

export { zWidget, zWidgetCreate };
export type { Widget, WidgetCreate };
