# Development Guidelines

This project uses **Bun** for dependency management and as the runtime. All
package scripts are defined in `package.json` and should be executed via
`bun run`.

## Installation

```bash
bun install
```

## Common Tasks

| Task           | Command                   | Description                                      |
| -------------- | ------------------------- | ------------------------------------------------ |
| Development    | `bun run dev`             | Run the Next.js development server.              |
| Lint           | `bun run lint`            | Check code style using ESLint.                   |
| Lint (fix)     | `bun run lint:fix`        | Automatically fix lint issues.                   |
| Format Check   | `bun run format:check`    | Verify Prettier formatting.                      |
| Format Write   | `bun run format:write`    | Format files with Prettier.                      |
| Type Check     | `bun run typecheck`       | Run TypeScript type checking.                    |
| Build          | `bun run build`           | Create a production build.                       |
| Start          | `bun run start`           | Start the production server after building.      |
| Preview        | `bun run preview`         | Build and start the server in one command.       |
| Check          | `bun run check`           | Run linting and TypeScript in a single step.     |
| -------------- | ------------------------- | ------------------------------------------------ |

## Contribution workflow

1. Before committing, run `bun run format:write`.
2. Ensure `bun run lint` and `bun run typecheck` succeed.
3. Optionally run `bun run build` to verify the project builds.

## Notes

- The repository uses ESM (`"type": "module"`). Avoid converting files to CommonJS.
- Ensure environment variables from `.env` are kept in sync with `.env.example` and `src/env.js`.
- Run `bun run check` before opening a pull request to ensure the codebase passes lint and type checks.
- The `src/database.types.ts` file auto generated, do not edit. Describe each update required and Ask the USER to make the update.
- Use existing libraries for design and implementations unless explicitly requested by the user.
- Always use proper types and type validations when needed. Use zod/v4 for type validations. Use unknown if the type is unknown and use zod to verify the actual runtime type.
