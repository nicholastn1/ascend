import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,

	client: {
		VITE_API_URL: z.string().url().optional(),
	},

	server: {
		TZ: z.string().default("Etc/UTC"),
		APP_URL: z.string().url().optional(),
	},
});
