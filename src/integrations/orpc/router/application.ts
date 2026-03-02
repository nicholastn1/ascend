import { protectedProcedure } from "../context";
import { applicationDto } from "../dto/application";
import { applicationService } from "../services/application";

const contactsRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/applications/{applicationId}/contacts",
			tags: ["Application Contacts"],
			operationId: "listApplicationContacts",
			summary: "List contacts for an application",
			description: "Returns all contacts associated with the specified application. Requires authentication.",
			successDescription: "A list of contacts for the application.",
		})
		.input(applicationDto.contacts.list.input)
		.output(applicationDto.contacts.list.output)
		.handler(async ({ context, input }) => {
			return await applicationService.contacts.list({ ...input, userId: context.user.id });
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/applications/{applicationId}/contacts",
			tags: ["Application Contacts"],
			operationId: "createApplicationContact",
			summary: "Add a contact to an application",
			description: "Creates a new contact for the specified application. Requires authentication.",
			successDescription: "The ID of the created contact.",
		})
		.input(applicationDto.contacts.create.input)
		.output(applicationDto.contacts.create.output)
		.handler(async ({ context, input }) => {
			return await applicationService.contacts.create({ ...input, userId: context.user.id });
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/applications/{applicationId}/contacts/{id}",
			tags: ["Application Contacts"],
			operationId: "updateApplicationContact",
			summary: "Update an application contact",
			description: "Updates fields of an existing contact. Requires authentication.",
			successDescription: "The updated contact.",
		})
		.input(applicationDto.contacts.update.input)
		.output(applicationDto.contacts.update.output)
		.handler(async ({ context, input }) => {
			return await applicationService.contacts.update({ ...input, userId: context.user.id });
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/applications/{applicationId}/contacts/{id}",
			tags: ["Application Contacts"],
			operationId: "deleteApplicationContact",
			summary: "Delete an application contact",
			description: "Removes a contact from the specified application. Requires authentication.",
			successDescription: "The contact was deleted successfully.",
		})
		.input(applicationDto.contacts.delete.input)
		.output(applicationDto.contacts.delete.output)
		.handler(async ({ context, input }) => {
			return await applicationService.contacts.delete({ ...input, userId: context.user.id });
		}),
};

const analyticsRouter = {
	overview: protectedProcedure
		.route({
			method: "GET",
			path: "/applications/analytics/overview",
			tags: ["Application Analytics"],
			operationId: "getApplicationAnalyticsOverview",
			summary: "Get application analytics overview",
			description:
				"Returns summary statistics: total applications, this week/month counts, and count by status. Requires authentication.",
			successDescription: "Overview analytics for the user's applications.",
		})
		.output(applicationDto.analytics.overview.output)
		.handler(async ({ context }) => {
			return await applicationService.analytics.overview({ userId: context.user.id });
		}),

	timeline: protectedProcedure
		.route({
			method: "GET",
			path: "/applications/analytics/timeline",
			tags: ["Application Analytics"],
			operationId: "getApplicationAnalyticsTimeline",
			summary: "Get applications timeline",
			description:
				"Returns the number of applications created over time, grouped by week or month. Requires authentication.",
			successDescription: "Timeline data for application creation.",
		})
		.input(applicationDto.analytics.timeline.input)
		.output(applicationDto.analytics.timeline.output)
		.handler(async ({ context, input }) => {
			return await applicationService.analytics.timeline({ userId: context.user.id, ...input });
		}),

	funnel: protectedProcedure
		.route({
			method: "GET",
			path: "/applications/analytics/funnel",
			tags: ["Application Analytics"],
			operationId: "getApplicationAnalyticsFunnel",
			summary: "Get application funnel metrics",
			description: "Returns conversion rates between consecutive application stages. Requires authentication.",
			successDescription: "Funnel conversion data.",
		})
		.output(applicationDto.analytics.funnel.output)
		.handler(async ({ context }) => {
			return await applicationService.analytics.funnel({ userId: context.user.id });
		}),

	avgTimeInStage: protectedProcedure
		.route({
			method: "GET",
			path: "/applications/analytics/avg-time",
			tags: ["Application Analytics"],
			operationId: "getApplicationAnalyticsAvgTime",
			summary: "Get average time in each stage",
			description:
				"Returns the average number of days applications spend in each status stage. Requires authentication.",
			successDescription: "Average time in stage data.",
		})
		.output(applicationDto.analytics.avgTimeInStage.output)
		.handler(async ({ context }) => {
			return await applicationService.analytics.avgTimeInStage({ userId: context.user.id });
		}),
};

export const applicationRouter = {
	contacts: contactsRouter,
	analytics: analyticsRouter,

	kanban: protectedProcedure
		.route({
			method: "GET",
			path: "/applications/kanban",
			tags: ["Applications"],
			operationId: "getApplicationKanban",
			summary: "Get kanban board data",
			description: "Returns all applications grouped by status for the kanban board view. Requires authentication.",
			successDescription: "Applications grouped by status column.",
		})
		.output(applicationDto.kanban.output)
		.handler(async ({ context }) => {
			return await applicationService.kanban({ userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/applications",
			tags: ["Applications"],
			operationId: "listApplications",
			summary: "List all applications",
			description:
				"Returns a filtered list of all applications. Supports filtering by status, company name, date range, and salary range. Requires authentication.",
			successDescription: "A list of applications matching the filters.",
		})
		.input(applicationDto.list.input)
		.output(applicationDto.list.output)
		.handler(async ({ context, input }) => {
			return await applicationService.list({ userId: context.user.id, ...input });
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/applications/{id}",
			tags: ["Applications"],
			operationId: "getApplication",
			summary: "Get application by ID",
			description: "Returns a single application with its contacts and status history. Requires authentication.",
			successDescription: "The application with contacts and history.",
		})
		.input(applicationDto.getById.input)
		.output(applicationDto.getById.output)
		.handler(async ({ context, input }) => {
			return await applicationService.getById({ id: input.id, userId: context.user.id });
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/applications",
			tags: ["Applications"],
			operationId: "createApplication",
			summary: "Create a new application",
			description:
				"Creates a new job application with the given details. Automatically creates an initial history entry. Requires authentication.",
			successDescription: "The ID of the created application.",
		})
		.input(applicationDto.create.input)
		.output(applicationDto.create.output)
		.handler(async ({ context, input }) => {
			return await applicationService.create({ userId: context.user.id, ...input });
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/applications/{id}",
			tags: ["Applications"],
			operationId: "updateApplication",
			summary: "Update an application",
			description:
				"Updates one or more fields of an application. Does not change status; use the move endpoint for that. Requires authentication.",
			successDescription: "The updated application.",
		})
		.input(applicationDto.update.input)
		.output(applicationDto.update.output)
		.handler(async ({ context, input }) => {
			const { id, ...data } = input;
			return await applicationService.update({ id, userId: context.user.id, ...data });
		}),

	move: protectedProcedure
		.route({
			method: "POST",
			path: "/applications/{id}/move",
			tags: ["Applications"],
			operationId: "moveApplication",
			summary: "Move application to a new status",
			description:
				"Changes the status of an application and creates a history entry tracking the transition. Used by drag-and-drop. Requires authentication.",
			successDescription: "The application with its updated status.",
		})
		.input(applicationDto.move.input)
		.output(applicationDto.move.output)
		.handler(async ({ context, input }) => {
			return await applicationService.move({ id: input.id, userId: context.user.id, status: input.status });
		}),

	history: protectedProcedure
		.route({
			method: "GET",
			path: "/applications/{applicationId}/history",
			tags: ["Applications"],
			operationId: "getApplicationHistory",
			summary: "Get application status history",
			description: "Returns the timeline of status changes for an application. Requires authentication.",
			successDescription: "The status change history for the application.",
		})
		.input(applicationDto.history.input)
		.output(applicationDto.history.output)
		.handler(async ({ context, input }) => {
			return await applicationService.history.list({ ...input, userId: context.user.id });
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/applications/{id}",
			tags: ["Applications"],
			operationId: "deleteApplication",
			summary: "Delete an application",
			description:
				"Permanently deletes an application and its associated contacts and history. Requires authentication.",
			successDescription: "The application was deleted successfully.",
		})
		.input(applicationDto.delete.input)
		.output(applicationDto.delete.output)
		.handler(async ({ context, input }) => {
			return await applicationService.delete({ id: input.id, userId: context.user.id });
		}),
};
