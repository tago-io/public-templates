import { z } from "zod";
import Module from "node:module";
import validator from "validator";
import { DateTime } from "luxon";

const requireModule = Module.createRequire(import.meta.url);
const objectid = requireModule("bson-objectid");

function generateID(): string {
  return objectid().toHexString();
}

function isValidID(id: string): boolean {
  if (typeof id !== "string") {
    return false;
  }

  if (id.length !== 24) {
    return false;
  }

  if (!validator.isMongoId(id)) {
    return false;
  }

  return true;
}

function fieldSizeChecker(field: {} | null | undefined, max_size: number) {
  if (!field) {
    return true;
  }

  const size = Buffer.byteLength(JSON.stringify(field), "utf8");
  if (size > max_size) {
    return false;
  }
  return true;
}

const durationLabelsStandard: any = {
  S: "millisecond",
  SS: "milliseconds",
  s: "second",
  ss: "seconds",
  sec: "seconds",
  m: "minute",
  mm: "minutes",
  min: "minutes",
  h: "hour",
  hh: "hours",
  d: "day",
  dd: "days",
  w: "week",
  ww: "weeks",
  M: "month",
  MM: "months",
  y: "year",
  yy: "years",
};

function fixDurationMoment(duration: string) {
  const trimmedDuration = String(duration || "").trim();
  return durationLabelsStandard[trimmedDuration] || trimmedDuration;
}

function parseRelativeDate(
  expireTime: string | undefined,
  operation: "plus" | "minus",
  fromDate = new Date()
) {
  if (!expireTime) {
    return;
  }

  if (expireTime.toLowerCase() === "never") {
    return "never";
  }

  const regex = /(\d+)/g;
  const splitted = expireTime.split(regex);

  if (splitted.length !== 3 || !splitted[1] || !splitted[2]) {
    throw "invalid relative time";
  }

  let time: DateTime;

  if (operation === "minus") {
    time = DateTime.fromJSDate(new Date(fromDate)).minus({
      [fixDurationMoment(splitted[2])]: Number(splitted[1]),
    });
  } else {
    time = DateTime.fromJSDate(new Date(fromDate)).plus({
      [fixDurationMoment(splitted[2])]: Number(splitted[1]),
    });
  }

  if (!time.isValid) {
    throw "invalid relative time";
  }

  return time.toJSDate();
}

const zJSONDate = z.preprocess((arg: any) => {
  if (["string", "number"].includes(typeof arg) || arg instanceof Date) {
    return new Date(arg);
  }
  return arg;
}, z.date());

const zName = z.string().min(1).max(100);

const zDateAutoGen = z
  .any()
  .optional()
  .default("any")
  .transform(() => new Date());

const zResourceID = z.string().refine((val) => isValidID(val), "Invalid ID");

const zResourceIDAutoGen = z
  .any()
  .optional()
  .default("any")
  .transform(() => generateID());

const zTagsWithMetadata = z.array(
  z.object({
    key: z.string(),
    value: z.string(),
    metadata: z
      .object({ run: z.boolean() })
      .passthrough()
      .nullish()
      .refine(
        (record) => fieldSizeChecker(record, 1000),
        "tag.metadata should be less than 1kB"
      ),
  })
);

type Name = z.infer<typeof zName>;
type ResourceID = z.infer<typeof zResourceID>;

export {
  zName,
  zDateAutoGen,
  zResourceID,
  zResourceIDAutoGen,
  zTagsWithMetadata,
  zJSONDate,
  parseRelativeDate,
  generateID,
  isValidID,
};

export type { Name, ResourceID };
