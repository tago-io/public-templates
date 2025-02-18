import { z } from "zod";
import { isObjectLike } from "lodash-es";
import { zResourceID, zResourceIDAutoGen, zDateAutoGen, zJSONDate } from "./utils/common.ts";

const VARIABLE_EXP = /^[a-z0-9_]+$/i;

const zLat = z.number().min(-90).max(90);
const zLng = z.number().min(-180).max(180);

function replaceSerieToGroup(value: any) {
  if (value.group) {
    value.serie = String(value.group);
    value.group = String(value.group);
  } else if (value.serie) {
    value.serie = String(value.serie);
    value.group = String(value.serie);
  }

  return value;
}

const zLocation = z
  .object({
    lat: zLat,
    lng: zLng,
  })
  .transform(({ lng, lat }) => {
    return { type: "Point", coordinates: [lng, lat] };
  });

const zLocationGis = z.object({
  type: z
    .any()
    .optional()
    .default("any")
    .transform(() => "Point"),
  coordinates: z.tuple([zLng, zLat]),
});

const zData = z.object({
  id: zResourceID,
  device: zResourceID.optional(),
  variable: z
    .string()
    .min(1)
    .max(100)
    .regex(VARIABLE_EXP, "Invalid variable name")
    .transform((val) => val.toLowerCase()),
  group: z
    .string()
    .max(100)
    .refine((v) => !v.includes(" "), "Spaces is not allowed on group field"),
  time: zJSONDate,
  created_at: z.date(),
  value: z
    .union([z.number(), z.string(), z.boolean(), z.nan()])
    .nullish()
    .optional()
    .refine((value) => {
      if (!value) {
        return true;
      }
      const size = Buffer.byteLength(JSON.stringify(value), "utf8");
      if (size > 6000) {
        return false;
      }
      return true;
    }, "Value should be less than 6kB")
    .transform((v) => (Number.isNaN(v) ? null : v)),
  unit: z.string().max(25).optional(),
  location: z.union([zLocation, zLocationGis]).optional().nullable(),
  metadata: z
    .any()
    .optional()
    .refine((value) => isObjectLike(value) || !value, "Is not json object")
    .refine((value) => {
      if (!value) {
        return true;
      }

      const size = Buffer.byteLength(JSON.stringify(value), "utf8");
      if (size > 10_000) {
        return false;
      }
      return true;
    }, "Metadata should be less than 10kB"),
});

const zDataCreate = zData
  .omit({ id: true, device: true })
  .extend({
    id: zResourceIDAutoGen,
    group: zData.shape.group.optional().nullish(),
    time: zData.shape.time
      .optional()
      .nullish()
      .default(() => new Date()),
    created_at: zDateAutoGen,
    serie: z.union([zData.shape.group.optional().nullish(), z.number().optional().nullish()]),
    origin: zResourceID.optional(),
    metadata: zData.shape.metadata.nullish(),
    unit: zData.shape.unit.nullish(),
  })
  .transform((value) => {
    const normalizedValue = replaceSerieToGroup(value);

    if (!normalizedValue.time) {
      normalizedValue.time = new Date();
    }

    return normalizedValue;
  });

const zDataUpdate = zData
  .omit({ variable: true, created_at: true, device: true })
  .extend({
    group: zData.shape.group.optional(),
    time: zData.shape.time.optional(),
    serie: zData.shape.group.optional(), // @deprecated
  })
  .transform((value) => replaceSerieToGroup(value));

type Data = z.infer<typeof zData>;
type DataCreate = Omit<z.infer<typeof zDataCreate>, "serie">;
type DataUpdate = z.infer<typeof zDataUpdate>;

export { zData, zDataCreate, zDataUpdate, VARIABLE_EXP };
export type { Data, DataCreate, DataUpdate };
