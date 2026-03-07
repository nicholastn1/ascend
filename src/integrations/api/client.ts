import createClient from "openapi-fetch";
import type { paths } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = createClient<paths>({
	baseUrl: API_BASE,
	credentials: "include",
	headers: {
		"Content-Type": "application/json",
	},
});

export { API_BASE };
