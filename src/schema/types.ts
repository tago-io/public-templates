import { Dashboard } from "../validator/dashboard";
import { Data } from "../validator/data";
import { Widget } from "../validator/widget";

type DashboardTemplateManifest = {
  name: string;
  images: {
    logo: string;
    banner?: string;
  };
  structure?: {
    standard?: string;
    blueprint?: string;
  } & (
    | { standard: string }
    | { blueprint: string }
  );
  manifest?: {
    standard?: string;
    blueprint?: string;
  } & (
    | { standard: string }
    | { blueprint: string }
  );
  description?: string;
};

type DashboardTemplateConfig = {
  type: "standard" | "blueprint";
  use_mock: boolean;
  description: string;
  structure: string;
  setup: {
    analysis?: {
      id: string;
      name: string;
      description: string;
    }[];
  } & (
    | {
        devices: {
          id: string;
          name: string;
          description: string;
        }[];
        blueprints?: never;
      }
    | {
        blueprints: {
          id: string;
          name: string;
          device_id: string;
          description: string;
        }[];
        devices?: never;
      }
  );
};

export type { DashboardTemplateManifest, DashboardTemplateConfig };
