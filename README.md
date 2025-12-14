# Rewind Viewer

A modern web application for browsing and visualizing your Claude Code conversation history with advanced features like real-time ETL progress streaming, Monaco code editor, statistics dashboards, and dark mode support.

## Architecture

This is a **pnpm monorepo** with three packages:

- **@rewind/api** - Hono API server with PostgreSQL + Drizzle ORM
- **@rewind/web** - React SPA built with React Router v7 + TanStack Query
- **@rewind/shared** - Shared TypeScript types used by both API and Web packages

```
┌─────────────────┐
│ Rewind Files    │  (.jsonl conversation files)
│ (configurable)  │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │   ETL   │  (watches files, transforms to PostgreSQL, SSE progress)
    └────┬────┘
         │
         ▼
┌────────────────┐
│  PostgreSQL    │  (5 tables: projects, conversations, messages,
│  (port 54321)  │   contentBlocks, processedFiles, settings)
└────────┬───────┘
         │
         ▼
    ┌─────────┐
    │ Hono API│  (port 3000, REST + SSE endpoints)
    └────┬────┘
         │
         ▼
┌─────────────────┐
│   React Web     │  (port 5173, Monaco editor, Statistics,
│                 │   Settings UI, Dark mode)
└─────────────────┘
```

## Setup

### 1. Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

**Optional**: Update `REWIND_DATA_PATH` in `.env` to point to your Claude Code data directory:

```bash
# Example for macOS
REWIND_DATA_PATH=/Users/yourusername/Library/Application Support/Rewind
```

**Note**: You can also configure the data path later via the Settings UI at `/settings`, which provides a directory browser with conversation detection. The Settings UI stores the path in the database and takes precedence over the environment variable.

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start PostgreSQL

```bash
docker-compose up -d
```

### 5. Set up Database

```bash
# Generate and push schema
pnpm db:push
```

### 6. Run ETL Process

Import your Rewind data into PostgreSQL:

```bash
# One-time import
pnpm etl:run

# Or watch for changes (recommended during development)
pnpm etl:watch
```

**Alternatively**, you can trigger ETL imports from the web UI:
- Navigate to the home page at `http://localhost:5173`
- Click the "Import Data" button
- Watch real-time progress via Server-Sent Events

### 7. Start Development Servers

```bash
# Start both API and Web in parallel
pnpm dev

# Or start individually
pnpm dev:api  # API on port 3000
pnpm dev:web  # Web on port 5173
```

## Development

### Available Scripts

**Development:**
- `pnpm dev` - Start both API and web in parallel
- `pnpm dev:api` - Start API server only (port 3000)
- `pnpm dev:web` - Start web app only (port 5173)

**Building:**
- `pnpm build` - Build all packages (API + Web)
- `pnpm build:api` - Build API package only
- `pnpm build:web` - Build Web package only

**Type Checking:**
- `pnpm typecheck` - Run TypeScript type checking on Web package
- `pnpm typecheck:web` - Run TypeScript type checking on Web package (alias)

**Database:**
- `pnpm db:generate` - Generate Drizzle migration files from schema changes
- `pnpm db:push` - Push schema changes directly to database (no migration files)
- `pnpm db:studio` - Open Drizzle Studio GUI at http://localhost:4983

**ETL:**
- `pnpm etl:run` - Run ETL process once
- `pnpm etl:watch` - Watch for file changes and auto-run ETL

**Production:**
- `pnpm start:api` - Start production API server (requires prior build)
- `pnpm start:web` - Serve production Web build

**Package-specific:**
- `pnpm --filter @rewind/api <command>`
- `pnpm --filter @rewind/web <command>`
- `pnpm --filter @rewind/shared <command>`

### Database Management

View and manage your data:

```bash
pnpm db:studio
```

This opens Drizzle Studio at [http://localhost:4983](http://localhost:4983)

### ETL Process

The ETL (Extract, Transform, Load) process:
1. Scans your Rewind data directory (configured via Settings UI or env var)
2. Reads conversation JSONL files (`.jsonl`)
3. Transforms and normalizes data
4. Extracts content blocks (thinking, tool use, tool results)
5. Aggregates token usage at conversation level
6. Upserts to PostgreSQL
7. Tracks processed files to avoid re-processing unchanged data
8. Streams real-time progress via Server-Sent Events (SSE)

**Run ETL in three ways:**

1. **Command Line - One Time**:
   ```bash
   pnpm etl:run
   ```

2. **Command Line - Watch Mode**:
   ```bash
   pnpm etl:watch
   ```

3. **Web UI** (Recommended):
   - Click "Import Data" button on home page
   - Watch real-time progress with event streaming

## Project Structure

```
rewind/
├── packages/
│   ├── api/                  # Hono API server
│   │   ├── src/
│   │   │   ├── db/          # Database schema & client
│   │   │   ├── etl/         # ETL service & scripts
│   │   │   ├── routes/      # API routes
│   │   │   └── index.ts     # Server entry point
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── web/                  # React web app
│   │   ├── app/
│   │   │   ├── components/  # UI components
│   │   │   ├── hooks/       # React hooks
│   │   │   ├── lib/         # Utilities & API client
│   │   │   └── routes/      # React Router routes
│   │   ├── react-router.config.ts
│   │   └── package.json
│   │
│   └── shared/               # Shared TypeScript types
│       ├── src/
│       │   ├── types.ts     # Type definitions
│       │   └── index.ts     # Exports
│       └── package.json
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── CLAUDE.md                 # Developer guidance for Claude Code
└── .env
```

## Features

### Core Features
- **Project Management**: Browse all your Claude Code projects with statistics
- **Conversation Viewer**: View conversations with rich formatting, syntax highlighting, and Monaco code editor
- **Content Blocks**: Display thinking blocks, tool use, and tool results separately
- **Search**: Full-text search across conversations with project filtering
- **Statistics Dashboard**: Visualize token usage, model distribution, and activity timelines
- **Real-time ETL**: Import data with live progress streaming via Server-Sent Events
- **Settings UI**: Configure data path with directory browser and conversation detection
- **Dark Mode**: System-aware dark/light theme with manual toggle
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS v4

### UI Features
- Grid/Table view toggle for projects
- Sortable and filterable data tables
- Three-tab conversation view: Conversation, Raw JSON, Statistics
- Monaco code editor with syntax highlighting and copy button
- Diff viewer for code changes
- Toast notifications
- Loading states and error boundaries

## API Endpoints

**Projects:**
- `GET /api/projects` - List all projects with stats (conversation count, message count, last activity)
- `GET /api/projects/:id` - Get single project
- `GET /api/projects/:id/conversations` - Get project conversations

**Conversations:**
- `GET /api/conversations/:id` - Get conversation with messages and content blocks
- `GET /api/conversations/search?q=query&projectId=id` - Search conversations (max 500 chars, max 50 results)

**ETL:**
- `POST /api/etl/run` - Trigger ETL import (background process)
- `GET /api/etl/status` - Get current ETL status
- `GET /api/etl/stream` - Stream ETL progress via Server-Sent Events

**Settings:**
- `GET /api/settings/data-path` - Get current data path
- `POST /api/settings/data-path` - Set/update data path
- `GET /api/settings/browse?path=...` - Browse directories with conversation detection
- `POST /api/settings/test-path` - Validate path and count projects/conversations

**Health:**
- `GET /api/health` - Health check endpoint

## Tech Stack

### API (@rewind/api)
- [Hono 4.7](https://hono.dev/) - Ultra-fast web framework with Node.js server adapter
- [Drizzle ORM 0.45](https://orm.drizzle.team/) - Type-safe SQL query builder with PostgreSQL driver
- [PostgreSQL 16](https://www.postgresql.org/) - Database (via Docker)
- [Chokidar 5.0](https://github.com/paulmillr/chokidar) - File system watcher for ETL
- [Winston 3.19](https://github.com/winstonjs/winston) - Structured logging with file and console transports
- [tsx 4.21](https://github.com/esbuild-kit/tsx) - TypeScript execution for development

### Web (@rewind/web)
- [React 19](https://react.dev/) - Latest React with concurrent features
- [React Router v7](https://reactrouter.com/) - File-based routing in SPA mode
- [TanStack Query v5](https://tanstack.com/query) - Server state management and caching
- [TanStack Table v8](https://tanstack.com/table) - Data table components with sorting/filtering
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first styling with Vite plugin
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible component primitives (40+ components)
- [Monaco Editor 0.55](https://microsoft.github.io/monaco-editor/) - Full-featured code editor with syntax highlighting
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering with syntax highlighting
- [Recharts 3.5](https://recharts.org/) - Data visualization charts
- [date-fns 4.1](https://date-fns.org/) - Date formatting utilities
- [Sonner 2.0](https://sonner.emilkowal.ski/) - Toast notifications
- [Lucide React](https://lucide.dev/) - Icon library
- [Vite 7.1](https://vitejs.dev/) - Build tool and dev server

### Shared (@rewind/shared)
- TypeScript types for API contracts and domain models
- No runtime dependencies - purely type definitions

## Troubleshooting

**PostgreSQL connection issues:**
```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart
```

**ETL not finding files:**
- Use the Settings UI at `/settings` to configure and test your data path
- Verify `REWIND_DATA_PATH` in `.env` points to correct directory (fallback option)
- Check file permissions
- Ensure JSONL files (`.jsonl`) exist in project subdirectories
- Set `LOG_LEVEL=debug` in `.env` for detailed logging output
- Use the "Test Path" button in Settings UI to validate the path

**Web app can't connect to API:**
- Verify API is running on port 3000
- Check `VITE_API_URL` in `.env` (should be `http://localhost:3000`)
- Check browser console for CORS errors
- Ensure `WEB_URL` in `.env` matches your frontend URL

**Debugging ETL issues:**
1. Configure data path via Settings UI at `/settings` (recommended)
2. Use "Test Path" button to validate and see project/conversation counts
3. Verify JSONL files (`.jsonl`) exist in project subdirectories
4. Run `pnpm etl:run` with console output to see processing logs
5. Use `pnpm db:studio` to inspect database tables directly
6. Check `processedFiles` table to see which files were processed and when
7. Set `LOG_LEVEL=debug` in `.env` for detailed logging output
8. Trigger ETL from web UI and watch real-time progress

For more information about logging, see [LOGGING.md](LOGGING.md)

## Environment Variables

The following environment variables can be configured in `.env` (see [.env.example](.env.example)):

**Database Configuration:**
- `POSTGRES_USER` - PostgreSQL username (default: `rewind`)
- `POSTGRES_PASSWORD` - PostgreSQL password (default: `rewind_dev_password`)
- `POSTGRES_DB` - PostgreSQL database name (default: `rewind`)
- `DATABASE_URL` - PostgreSQL connection string (default: `postgresql://rewind:rewind_dev_password@localhost:54321/rewind`)

**API Configuration:**
- `API_PORT` - API server port (default: `3000`)
- `WEB_URL` - Frontend URL for CORS (default: `http://localhost:5173`)

**Web Configuration:**
- `VITE_API_URL` - API base URL for frontend (default: `http://localhost:3000`)

**Logging Configuration:**
- `LOG_LEVEL` - Logging verbosity: `error`, `warn`, `info`, `verbose`, `debug` (default: `info`)
- `NODE_ENV` - Environment mode: `development` or `production` (affects logging behavior)

**Data Path Configuration:**
- `REWIND_DATA_PATH` - Path to Claude Code data directory (e.g., `/Users/yourusername/Library/Application Support/Rewind`)
  - **Note**: Can also be configured via Settings UI at `/settings`
  - Database setting takes precedence over environment variable

## License

MIT
