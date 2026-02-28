# Reactive Resume

A career management platform for creating, updating, and sharing resumes.

## Features

- Real-time preview with 12+ customizable templates
- PDF and JSON export
- AI-powered content generation (OpenAI, Anthropic, Google Gemini, Ollama)
- Multi-language support (56 languages)
- Passkey and 2FA authentication
- Public sharing with password protection
- API access and MCP server integration
- Custom CSS support
- Self-hosted with Docker

## Development

### Prerequisites

- Node.js 24+
- pnpm 10.30.3
- PostgreSQL
- Browserless/Chromium (for PDF generation)

### Quick Start

```bash
# Start dev services (PostgreSQL, Browserless, SeaweedFS)
docker compose -f compose.dev.yml up -d

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run Biome linter
pnpm typecheck        # Run TypeScript type checking
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run pending migrations
pnpm db:studio        # Open Drizzle Studio
```

## Docker Deployment

```bash
docker compose up -d
```

See `compose.yml` for the full production configuration.

## License

MIT
