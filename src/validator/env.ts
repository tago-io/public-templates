import { z } from "zod";

const zEnv = z.object({
  TEMPLATES_ASSET_DOMAIN: z.string(),
});

// eslint-disable-next-line no-process-env
const envParsed = zEnv.parse(process.env);

export { envParsed as env };
