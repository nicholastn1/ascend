import z from "zod";

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	username: string;
	display_username: string;
	image: string | null;
	email_verified: boolean;
	two_factor_enabled: boolean;
	created_at: string;
	updated_at: string;
};

export type AuthSession = {
	user: AuthUser;
};

const authProviderSchema = z.enum(["credential", "google", "github", "custom"]);

export type AuthProvider = z.infer<typeof authProviderSchema>;
