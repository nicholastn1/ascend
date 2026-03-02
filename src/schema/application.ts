import z from "zod";

export const applicationStatusSchema = z.enum([
	"applied",
	"screening",
	"interviewing",
	"offer",
	"accepted",
	"rejected",
	"withdrawn",
]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const APPLICATION_STATUSES = applicationStatusSchema.options;

export const salaryPeriodSchema = z.enum(["monthly", "yearly"]);

export type SalaryPeriod = z.infer<typeof salaryPeriodSchema>;

export const applicationContactSchema = z.object({
	id: z.string().uuid(),
	applicationId: z.string().uuid(),
	name: z.string().min(1).max(255),
	role: z.string().max(100).nullable().optional(),
	email: z.string().email().nullable().optional(),
	phone: z.string().max(30).nullable().optional(),
	linkedinUrl: z.string().url().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type ApplicationContact = z.infer<typeof applicationContactSchema>;

export const applicationHistorySchema = z.object({
	id: z.string().uuid(),
	applicationId: z.string().uuid(),
	fromStatus: applicationStatusSchema.nullable(),
	toStatus: applicationStatusSchema,
	changedAt: z.date(),
});

export type ApplicationHistory = z.infer<typeof applicationHistorySchema>;

export const applicationSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	currentStatus: applicationStatusSchema,
	companyName: z.string().min(1).max(255),
	jobTitle: z.string().min(1).max(255),
	jobUrl: z.string().url().nullable().optional(),
	salaryAmount: z.string().nullable().optional(),
	salaryCurrency: z.string().max(3).nullable().optional(),
	salaryPeriod: salaryPeriodSchema.nullable().optional(),
	notes: z.string().nullable().optional(),
	applicationDate: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type Application = z.infer<typeof applicationSchema>;

export const kanbanBoardSchema = z.object({
	applied: z.array(applicationSchema.omit({ userId: true })),
	screening: z.array(applicationSchema.omit({ userId: true })),
	interviewing: z.array(applicationSchema.omit({ userId: true })),
	offer: z.array(applicationSchema.omit({ userId: true })),
	accepted: z.array(applicationSchema.omit({ userId: true })),
	rejected: z.array(applicationSchema.omit({ userId: true })),
	withdrawn: z.array(applicationSchema.omit({ userId: true })),
});

export type KanbanBoard = z.infer<typeof kanbanBoardSchema>;
