import { z } from "zod";
import { zDashboardCreate } from "./dashboard";
import { zWidgetCreate } from "./widget";

const zDashboardStructure = z.object({
  dashboard: zDashboardCreate,
  widgets: zWidgetCreate.array().min(1).max(100),
});

type DashboardStructure = z.infer<typeof zDashboardStructure>;

export { zDashboardStructure };

export type { DashboardStructure };
