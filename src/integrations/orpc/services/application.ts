import { ORPCError } from "@orpc/client";
import { and, count, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { APPLICATION_STATUSES, type ApplicationStatus, type KanbanBoard } from "@/schema/application";
import { generateId } from "@/utils/string";

const contacts = {
	list: async (input: { applicationId: string; userId: string }) => {
		const app = await verifyOwnership(input.applicationId, input.userId);
		if (!app) throw new ORPCError("NOT_FOUND");

		return await db
			.select({
				id: schema.applicationContact.id,
				name: schema.applicationContact.name,
				role: schema.applicationContact.role,
				email: schema.applicationContact.email,
				phone: schema.applicationContact.phone,
				linkedinUrl: schema.applicationContact.linkedinUrl,
				createdAt: schema.applicationContact.createdAt,
				updatedAt: schema.applicationContact.updatedAt,
			})
			.from(schema.applicationContact)
			.where(eq(schema.applicationContact.applicationId, input.applicationId));
	},

	create: async (input: {
		applicationId: string;
		userId: string;
		name: string;
		role?: string | null;
		email?: string | null;
		phone?: string | null;
		linkedinUrl?: string | null;
	}) => {
		const app = await verifyOwnership(input.applicationId, input.userId);
		if (!app) throw new ORPCError("NOT_FOUND");

		const id = generateId();
		await db.insert(schema.applicationContact).values({
			id,
			applicationId: input.applicationId,
			name: input.name,
			role: input.role,
			email: input.email,
			phone: input.phone,
			linkedinUrl: input.linkedinUrl,
		});

		return id;
	},

	update: async (input: {
		id: string;
		applicationId: string;
		userId: string;
		name?: string;
		role?: string | null;
		email?: string | null;
		phone?: string | null;
		linkedinUrl?: string | null;
	}) => {
		const app = await verifyOwnership(input.applicationId, input.userId);
		if (!app) throw new ORPCError("NOT_FOUND");

		const [contact] = await db
			.update(schema.applicationContact)
			.set({
				name: input.name,
				role: input.role,
				email: input.email,
				phone: input.phone,
				linkedinUrl: input.linkedinUrl,
			})
			.where(
				and(
					eq(schema.applicationContact.id, input.id),
					eq(schema.applicationContact.applicationId, input.applicationId),
				),
			)
			.returning({
				id: schema.applicationContact.id,
				name: schema.applicationContact.name,
				role: schema.applicationContact.role,
				email: schema.applicationContact.email,
				phone: schema.applicationContact.phone,
				linkedinUrl: schema.applicationContact.linkedinUrl,
				createdAt: schema.applicationContact.createdAt,
				updatedAt: schema.applicationContact.updatedAt,
			});

		if (!contact) throw new ORPCError("NOT_FOUND");
		return contact;
	},

	delete: async (input: { id: string; applicationId: string; userId: string }) => {
		const app = await verifyOwnership(input.applicationId, input.userId);
		if (!app) throw new ORPCError("NOT_FOUND");

		await db
			.delete(schema.applicationContact)
			.where(
				and(
					eq(schema.applicationContact.id, input.id),
					eq(schema.applicationContact.applicationId, input.applicationId),
				),
			);
	},
};

const history = {
	list: async (input: { applicationId: string; userId: string }) => {
		const app = await verifyOwnership(input.applicationId, input.userId);
		if (!app) throw new ORPCError("NOT_FOUND");

		return await db
			.select({
				id: schema.applicationHistory.id,
				fromStatus: schema.applicationHistory.fromStatus,
				toStatus: schema.applicationHistory.toStatus,
				changedAt: schema.applicationHistory.changedAt,
			})
			.from(schema.applicationHistory)
			.where(eq(schema.applicationHistory.applicationId, input.applicationId))
			.orderBy(desc(schema.applicationHistory.changedAt));
	},
};

const analytics = {
	overview: async (input: { userId: string }) => {
		const now = new Date();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay());
		startOfWeek.setHours(0, 0, 0, 0);

		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		const [totalResult] = await db
			.select({ count: count() })
			.from(schema.application)
			.where(eq(schema.application.userId, input.userId));

		const [weekResult] = await db
			.select({ count: count() })
			.from(schema.application)
			.where(and(eq(schema.application.userId, input.userId), gte(schema.application.createdAt, startOfWeek)));

		const [monthResult] = await db
			.select({ count: count() })
			.from(schema.application)
			.where(and(eq(schema.application.userId, input.userId), gte(schema.application.createdAt, startOfMonth)));

		const statusCounts = await db
			.select({
				status: schema.application.currentStatus,
				count: count(),
			})
			.from(schema.application)
			.where(eq(schema.application.userId, input.userId))
			.groupBy(schema.application.currentStatus);

		const byStatus: Record<string, number> = {};
		for (const s of APPLICATION_STATUSES) {
			byStatus[s] = 0;
		}
		for (const row of statusCounts) {
			byStatus[row.status] = row.count;
		}

		return {
			total: totalResult.count,
			thisWeek: weekResult.count,
			thisMonth: monthResult.count,
			byStatus,
		};
	},

	timeline: async (input: { userId: string; groupBy: "week" | "month"; months: number }) => {
		const cutoff = new Date();
		cutoff.setMonth(cutoff.getMonth() - input.months);

		const truncFn =
			input.groupBy === "week" ? sql`date_trunc('week', created_at)` : sql`date_trunc('month', created_at)`;

		const rows = await db
			.select({
				period: sql<string>`to_char(${truncFn}, 'YYYY-MM-DD')`.as("period"),
				count: count(),
			})
			.from(schema.application)
			.where(and(eq(schema.application.userId, input.userId), gte(schema.application.createdAt, cutoff)))
			.groupBy(sql`${truncFn}`)
			.orderBy(sql`${truncFn}`);

		return rows;
	},

	funnel: async (input: { userId: string }) => {
		const funnelStages: [ApplicationStatus, ApplicationStatus][] = [
			["applied", "screening"],
			["screening", "interviewing"],
			["interviewing", "offer"],
			["offer", "accepted"],
		];

		const results = [];

		for (const [from, to] of funnelStages) {
			const [fromCount] = await db
				.select({ count: count() })
				.from(schema.applicationHistory)
				.innerJoin(schema.application, eq(schema.applicationHistory.applicationId, schema.application.id))
				.where(and(eq(schema.application.userId, input.userId), eq(schema.applicationHistory.toStatus, from)));

			const [toCount] = await db
				.select({ count: count() })
				.from(schema.applicationHistory)
				.innerJoin(schema.application, eq(schema.applicationHistory.applicationId, schema.application.id))
				.where(and(eq(schema.application.userId, input.userId), eq(schema.applicationHistory.toStatus, to)));

			results.push({
				fromStatus: from,
				toStatus: to,
				count: toCount.count,
				rate: fromCount.count > 0 ? Math.round((toCount.count / fromCount.count) * 100) : 0,
			});
		}

		return results;
	},

	avgTimeInStage: async (input: { userId: string }) => {
		const result = await db.execute<{ status: string; avg_days: string }>(sql`
			SELECT sub.from_status AS status, COALESCE(AVG(sub.days_in_stage), 0) AS avg_days
			FROM (
				SELECT
					h.from_status,
					EXTRACT(EPOCH FROM (
						lead(h.changed_at) OVER (
							PARTITION BY h.application_id ORDER BY h.changed_at
						) - h.changed_at
					)) / 86400 AS days_in_stage
				FROM ${schema.applicationHistory} h
				INNER JOIN ${schema.application} a ON h.application_id = a.id
				WHERE a.user_id = ${input.userId} AND h.from_status IS NOT NULL
			) sub
			WHERE sub.days_in_stage IS NOT NULL
			GROUP BY sub.from_status
		`);

		return result.rows
			.filter((r: { status: string; avg_days: string }) => r.status !== null)
			.map((r: { status: string; avg_days: string }) => ({
				status: r.status as ApplicationStatus,
				avgDays: Math.round(Number(r.avg_days) * 10) / 10,
			}));
	},
};

async function verifyOwnership(applicationId: string, userId: string) {
	const [app] = await db
		.select({ id: schema.application.id })
		.from(schema.application)
		.where(and(eq(schema.application.id, applicationId), eq(schema.application.userId, userId)));

	return app;
}

export const applicationService = {
	contacts,
	history,
	analytics,

	kanban: async (input: { userId: string }) => {
		const apps = await db
			.select({
				id: schema.application.id,
				currentStatus: schema.application.currentStatus,
				companyName: schema.application.companyName,
				jobTitle: schema.application.jobTitle,
				jobUrl: schema.application.jobUrl,
				salaryAmount: schema.application.salaryAmount,
				salaryCurrency: schema.application.salaryCurrency,
				salaryPeriod: schema.application.salaryPeriod,
				notes: schema.application.notes,
				applicationDate: schema.application.applicationDate,
				createdAt: schema.application.createdAt,
				updatedAt: schema.application.updatedAt,
			})
			.from(schema.application)
			.where(eq(schema.application.userId, input.userId))
			.orderBy(desc(schema.application.updatedAt));

		const board = {
			applied: [],
			screening: [],
			interviewing: [],
			offer: [],
			accepted: [],
			rejected: [],
			withdrawn: [],
		} as Record<ApplicationStatus, typeof apps>;

		for (const app of apps) {
			board[app.currentStatus].push(app);
		}

		return board as KanbanBoard;
	},

	list: async (input: {
		userId: string;
		status?: ApplicationStatus;
		company?: string;
		dateFrom?: string;
		dateTo?: string;
		salaryMin?: number;
		salaryMax?: number;
	}) => {
		return await db
			.select({
				id: schema.application.id,
				currentStatus: schema.application.currentStatus,
				companyName: schema.application.companyName,
				jobTitle: schema.application.jobTitle,
				jobUrl: schema.application.jobUrl,
				salaryAmount: schema.application.salaryAmount,
				salaryCurrency: schema.application.salaryCurrency,
				salaryPeriod: schema.application.salaryPeriod,
				notes: schema.application.notes,
				applicationDate: schema.application.applicationDate,
				createdAt: schema.application.createdAt,
				updatedAt: schema.application.updatedAt,
			})
			.from(schema.application)
			.where(
				and(
					eq(schema.application.userId, input.userId),
					input.status ? eq(schema.application.currentStatus, input.status) : undefined,
					input.company ? ilike(schema.application.companyName, `%${input.company}%`) : undefined,
					input.dateFrom ? gte(schema.application.createdAt, new Date(input.dateFrom)) : undefined,
					input.dateTo ? lte(schema.application.createdAt, new Date(input.dateTo)) : undefined,
					input.salaryMin ? gte(sql`CAST(${schema.application.salaryAmount} AS numeric)`, input.salaryMin) : undefined,
					input.salaryMax ? lte(sql`CAST(${schema.application.salaryAmount} AS numeric)`, input.salaryMax) : undefined,
				),
			)
			.orderBy(desc(schema.application.updatedAt));
	},

	getById: async (input: { id: string; userId: string }) => {
		const [app] = await db
			.select({
				id: schema.application.id,
				currentStatus: schema.application.currentStatus,
				companyName: schema.application.companyName,
				jobTitle: schema.application.jobTitle,
				jobUrl: schema.application.jobUrl,
				salaryAmount: schema.application.salaryAmount,
				salaryCurrency: schema.application.salaryCurrency,
				salaryPeriod: schema.application.salaryPeriod,
				notes: schema.application.notes,
				applicationDate: schema.application.applicationDate,
				createdAt: schema.application.createdAt,
				updatedAt: schema.application.updatedAt,
			})
			.from(schema.application)
			.where(and(eq(schema.application.id, input.id), eq(schema.application.userId, input.userId)));

		if (!app) throw new ORPCError("NOT_FOUND");

		const appContacts = await db
			.select({
				id: schema.applicationContact.id,
				name: schema.applicationContact.name,
				role: schema.applicationContact.role,
				email: schema.applicationContact.email,
				phone: schema.applicationContact.phone,
				linkedinUrl: schema.applicationContact.linkedinUrl,
				createdAt: schema.applicationContact.createdAt,
				updatedAt: schema.applicationContact.updatedAt,
			})
			.from(schema.applicationContact)
			.where(eq(schema.applicationContact.applicationId, input.id));

		const appHistory = await db
			.select({
				id: schema.applicationHistory.id,
				fromStatus: schema.applicationHistory.fromStatus,
				toStatus: schema.applicationHistory.toStatus,
				changedAt: schema.applicationHistory.changedAt,
			})
			.from(schema.applicationHistory)
			.where(eq(schema.applicationHistory.applicationId, input.id))
			.orderBy(desc(schema.applicationHistory.changedAt));

		return { ...app, contacts: appContacts, history: appHistory };
	},

	create: async (input: {
		userId: string;
		companyName: string;
		jobTitle: string;
		currentStatus?: ApplicationStatus;
		jobUrl?: string | null;
		salaryAmount?: string | null;
		salaryCurrency?: string | null;
		salaryPeriod?: "monthly" | "yearly" | null;
		notes?: string | null;
		applicationDate?: string | null;
	}) => {
		const id = generateId();
		const status = input.currentStatus ?? "applied";

		await db.insert(schema.application).values({
			id,
			userId: input.userId,
			currentStatus: status,
			companyName: input.companyName,
			jobTitle: input.jobTitle,
			jobUrl: input.jobUrl,
			salaryAmount: input.salaryAmount,
			salaryCurrency: input.salaryCurrency,
			salaryPeriod: input.salaryPeriod,
			notes: input.notes,
			applicationDate: input.applicationDate,
		});

		// Create initial history entry
		await db.insert(schema.applicationHistory).values({
			applicationId: id,
			fromStatus: null,
			toStatus: status,
		});

		return id;
	},

	update: async (input: {
		id: string;
		userId: string;
		companyName?: string;
		jobTitle?: string;
		jobUrl?: string | null;
		salaryAmount?: string | null;
		salaryCurrency?: string | null;
		salaryPeriod?: "monthly" | "yearly" | null;
		notes?: string | null;
		applicationDate?: string | null;
	}) => {
		const [app] = await db
			.update(schema.application)
			.set({
				companyName: input.companyName,
				jobTitle: input.jobTitle,
				jobUrl: input.jobUrl,
				salaryAmount: input.salaryAmount,
				salaryCurrency: input.salaryCurrency,
				salaryPeriod: input.salaryPeriod,
				notes: input.notes,
				applicationDate: input.applicationDate,
			})
			.where(and(eq(schema.application.id, input.id), eq(schema.application.userId, input.userId)))
			.returning({
				id: schema.application.id,
				currentStatus: schema.application.currentStatus,
				companyName: schema.application.companyName,
				jobTitle: schema.application.jobTitle,
				jobUrl: schema.application.jobUrl,
				salaryAmount: schema.application.salaryAmount,
				salaryCurrency: schema.application.salaryCurrency,
				salaryPeriod: schema.application.salaryPeriod,
				notes: schema.application.notes,
				applicationDate: schema.application.applicationDate,
				createdAt: schema.application.createdAt,
				updatedAt: schema.application.updatedAt,
			});

		if (!app) throw new ORPCError("NOT_FOUND");
		return app;
	},

	move: async (input: { id: string; userId: string; status: ApplicationStatus }) => {
		const [existing] = await db
			.select({ currentStatus: schema.application.currentStatus })
			.from(schema.application)
			.where(and(eq(schema.application.id, input.id), eq(schema.application.userId, input.userId)));

		if (!existing) throw new ORPCError("NOT_FOUND");
		if (existing.currentStatus === input.status) {
			// No-op if status unchanged
			const [app] = await db
				.select({
					id: schema.application.id,
					currentStatus: schema.application.currentStatus,
					companyName: schema.application.companyName,
					jobTitle: schema.application.jobTitle,
					jobUrl: schema.application.jobUrl,
					salaryAmount: schema.application.salaryAmount,
					salaryCurrency: schema.application.salaryCurrency,
					salaryPeriod: schema.application.salaryPeriod,
					notes: schema.application.notes,
					applicationDate: schema.application.applicationDate,
					createdAt: schema.application.createdAt,
					updatedAt: schema.application.updatedAt,
				})
				.from(schema.application)
				.where(eq(schema.application.id, input.id));
			return app;
		}

		const [app] = await db
			.update(schema.application)
			.set({ currentStatus: input.status })
			.where(and(eq(schema.application.id, input.id), eq(schema.application.userId, input.userId)))
			.returning({
				id: schema.application.id,
				currentStatus: schema.application.currentStatus,
				companyName: schema.application.companyName,
				jobTitle: schema.application.jobTitle,
				jobUrl: schema.application.jobUrl,
				salaryAmount: schema.application.salaryAmount,
				salaryCurrency: schema.application.salaryCurrency,
				salaryPeriod: schema.application.salaryPeriod,
				notes: schema.application.notes,
				applicationDate: schema.application.applicationDate,
				createdAt: schema.application.createdAt,
				updatedAt: schema.application.updatedAt,
			});

		if (!app) throw new ORPCError("NOT_FOUND");

		// Create history entry
		await db.insert(schema.applicationHistory).values({
			applicationId: input.id,
			fromStatus: existing.currentStatus,
			toStatus: input.status,
		});

		return app;
	},

	delete: async (input: { id: string; userId: string }) => {
		await db
			.delete(schema.application)
			.where(and(eq(schema.application.id, input.id), eq(schema.application.userId, input.userId)));
	},
};
