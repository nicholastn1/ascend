import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createFileRoute } from "@tanstack/react-router";
import { logger } from "@/utils/logger";
import { registerPrompts } from "./-helpers/prompts";
import { registerResources } from "./-helpers/resources";
import { registerTools } from "./-helpers/tools";

function createMcpServer() {
	const server = new McpServer({
		name: "ascend",
		version: "1.0.0",
		title: "Ascend",
		description:
			"Ascend is a career command center. Use this MCP server to interact with your resume using an LLM of your choice.",
	});

	registerResources(server);
	registerTools(server);
	registerPrompts(server);

	return server;
}

export const Route = createFileRoute("/mcp/")({
	server: {
		handlers: {
			ANY: async ({ request }) => {
				try {
					const apiKey = request.headers.get("x-api-key");
					if (!apiKey) throw new Error("Unauthorized");

					const server = createMcpServer();
					const transport = new WebStandardStreamableHTTPServerTransport({
						enableJsonResponse: true,
					});

					await server.connect(transport);

					return await transport.handleRequest(request);
				} catch (error) {
					logger.error("MCP request failed", {
						route: "/mcp",
						error,
					});

					return Response.json({
						id: null,
						jsonrpc: "2.0",
						error: {
							code: -32603,
							message: `Error handling request: ${error instanceof Error ? error.message : String(error)}`,
						},
					});
				}
			},
		},
	},
});
