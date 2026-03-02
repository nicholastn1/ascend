import z from "zod";
import {
	applicationContactSchema,
	applicationHistorySchema,
	applicationSchema,
	applicationStatusSchema,
	kanbanBoardSchema,
	salaryPeriodSchema,
} from "@/schema/application";

const applicationOutput = applicationSchema.omit({ userId: true });

export const applicationDto = {
	kanban: {
		output: kanbanBoardSchema,
	},

	list: {
		input: z
			.object({
				status: applicationStatusSchema.optional(),
				company: z.string().optional(),
				dateFrom: z.string().optional(),
				dateTo: z.string().optional(),
				salaryMin: z.number().optional(),
				salaryMax: z.number().optional(),
			})
			.optional()
			.default({}),
		output: z.array(applicationOutput),
	},

	getById: {
		input: z.object({ id: z.string().describe("The unique identifier of the application.") }),
		output: applicationOutput.extend({
			contacts: z.array(applicationContactSchema.omit({ applicationId: true })),
			history: z.array(applicationHistorySchema.omit({ applicationId: true })),
		}),
	},

	create: {
		input: z.object({
			companyName: z.string().min(1).max(255),
			jobTitle: z.string().min(1).max(255),
			currentStatus: applicationStatusSchema.optional().default("applied"),
			jobUrl: z.string().url().nullable().optional(),
			salaryAmount: z.string().nullable().optional(),
			salaryCurrency: z.string().max(3).nullable().optional(),
			salaryPeriod: salaryPeriodSchema.nullable().optional(),
			notes: z.string().nullable().optional(),
			applicationDate: z.string().nullable().optional(),
		}),
		output: z.string().describe("The ID of the created application."),
	},

	update: {
		input: z
			.object({
				companyName: z.string().min(1).max(255),
				jobTitle: z.string().min(1).max(255),
				jobUrl: z.string().url().nullable(),
				salaryAmount: z.string().nullable(),
				salaryCurrency: z.string().max(3).nullable(),
				salaryPeriod: salaryPeriodSchema.nullable(),
				notes: z.string().nullable(),
				applicationDate: z.string().nullable(),
			})
			.partial()
			.extend({ id: z.string() }),
		output: applicationOutput,
	},

	delete: {
		input: z.object({ id: z.string() }),
		output: z.void(),
	},

	move: {
		input: z.object({
			id: z.string(),
			status: applicationStatusSchema,
		}),
		output: applicationOutput,
	},

	contacts: {
		list: {
			input: z.object({ applicationId: z.string() }),
			output: z.array(applicationContactSchema.omit({ applicationId: true })),
		},
		create: {
			input: z.object({
				applicationId: z.string(),
				name: z.string().min(1).max(255),
				role: z.string().max(100).nullable().optional(),
				email: z.string().email().nullable().optional(),
				phone: z.string().max(30).nullable().optional(),
				linkedinUrl: z.string().url().nullable().optional(),
			}),
			output: z.string().describe("The ID of the created contact."),
		},
		update: {
			input: z
				.object({
					name: z.string().min(1).max(255),
					role: z.string().max(100).nullable(),
					email: z.string().email().nullable(),
					phone: z.string().max(30).nullable(),
					linkedinUrl: z.string().url().nullable(),
				})
				.partial()
				.extend({ id: z.string(), applicationId: z.string() }),
			output: applicationContactSchema.omit({ applicationId: true }),
		},
		delete: {
			input: z.object({ id: z.string(), applicationId: z.string() }),
			output: z.void(),
		},
	},

	history: {
		input: z.object({ applicationId: z.string() }),
		output: z.array(applicationHistorySchema.omit({ applicationId: true })),
	},

	analytics: {
		overview: {
			output: z.object({
				total: z.number(),
				thisWeek: z.number(),
				thisMonth: z.number(),
				byStatus: z.record(applicationStatusSchema, z.number()),
			}),
		},
		timeline: {
			input: z
				.object({
					groupBy: z.enum(["week", "month"]).optional().default("week"),
					months: z.number().min(1).max(12).optional().default(3),
				})
				.optional()
				.default({ groupBy: "week", months: 3 }),
			output: z.array(z.object({ period: z.string(), count: z.number() })),
		},
		funnel: {
			output: z.array(
				z.object({
					fromStatus: applicationStatusSchema,
					toStatus: applicationStatusSchema,
					count: z.number(),
					rate: z.number(),
				}),
			),
		},
		avgTimeInStage: {
			output: z.array(
				z.object({
					status: applicationStatusSchema,
					avgDays: z.number(),
				}),
			),
		},
	},
};
