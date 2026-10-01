# Project Starter Agent Docs

Generate starter project memory files for AI-assisted development:

- `AGENTS.md`
- `CLAUDE.md`
- `PROJECT_BRIEF.md`
- `docs/` starter docs
- `logs/` progress, error, experiment, and handoff logs
- `.gitignore`

The template structure follows this shared pattern:

- persistent project mission
- non-negotiable rules
- first-run procedure for every AI
- verification rules
- security rules
- architecture and UI guidance
- docs and logs as long-term memory
- handoff file for fresh sessions
- definition of done

## Quick Start

Run interactively:

```bash
npm start
```

Generate directly:

```bash
node ./bin/project-starter.js init --name "MovieAura" --type web --stack "Next.js, Supabase, Tailwind" --output ./out/movieaura
```

Generate from a richer project profile:

```bash
node ./bin/project-starter.js init \
  --name "Agent Docs Builder" \
  --type desktop \
  --stack "Tauri, React, TypeScript" \
  --description "Generate AI-ready starter docs for new software projects." \
  --features "Project profile wizard, AGENTS.md generator, CLAUDE.md generator, docs/logs scaffold" \
  --structure "src/, templates/, presets/, docs/, logs/" \
  --commands "npm run dev, npm run build, npm test" \
  --rules "Do not overwrite existing files unless --force is passed" \
  --output ./out/agent-docs-builder
```

Use the current folder as the target:

```bash
node ./bin/project-starter.js init --name "My Project" --type generic --output .
```

Overwrite existing generated files:

```bash
node ./bin/project-starter.js init --name "My Project" --type desktop --force
```

Preview without writing:

```bash
node ./bin/project-starter.js init --name "My Project" --type android --dry-run
```

## Presets

Supported `--type` values:

- `generic`
- `web`
- `android`
- `desktop`

Presets change the generated verification, architecture, security, and workflow rules. You can still pass any stack with `--stack`.

## Profile Inputs

The generator can ask for, or accept flags for:

- project name
- project type
- stack
- mission/description
- planned features
- expected folders/files
- known commands
- special AI/project rules
- constraints and context (`--constraints`): what an AI cannot guess, such as target hardware, performance targets, security needs, and preferred or avoided approaches. Without this, AI tends to pick the most common solution rather than the best fit for your project.

For list fields, separate items with commas or semicolons.

## Generated Files

`AGENTS.md` is the main operating manual for AI coding agents.

`CLAUDE.md` is a short Claude-specific entry file that tells Claude to use the same repository memory instead of relying on chat history.

`PROJECT_BRIEF.md` captures the human-readable project profile.

`docs/` and `logs/` provide the project memory structure used by the generated instructions.

## Development

Check the Node files:

```bash
npm run check
```

No dependencies are required.
