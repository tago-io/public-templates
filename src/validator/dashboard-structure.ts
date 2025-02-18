import { z } from "zod";
import { zDashboardCreate } from "./dashboard";
import { zWidgetCreate } from "./widget";
import { zDataCreate } from "./data";

const zDashboardStructure = z.object({
  dashboard: zDashboardCreate,
  widgets: zWidgetCreate.array().min(1).max(100),
  mock_data: zDataCreate.array().nullish(),
});

type DashboardStructure = z.infer<typeof zDashboardStructure>;

export { zDashboardStructure };

export type { DashboardStructure };
