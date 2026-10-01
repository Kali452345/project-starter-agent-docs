const { getPreset } = require("./presets");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function list(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function numbered(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function splitItems(value) {
  if (!value || !value.trim()) {
    return [];
  }

  return value
    .split(/[\n;,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stackLine(profile) {
  return profile.stack && profile.stack.trim()
    ? profile.stack.trim()
    : "Document the selected stack here before implementation begins.";
}

function projectMission(profile) {
  if (profile.description && profile.description.trim()) {
    return profile.description.trim();
  }

  return `Build and maintain ${profile.name} with clear project memory, repeatable verification, and enough documentation for a new AI or developer to continue without relying on chat history.`;
}

function optionalListSection(title, items, fallback) {
  const values = splitItems(items);
  if (values.length) {
    return `## ${title}\n\n${list(values)}\n`;
  }

  return `## ${title}\n\n${fallback}\n`;
}

function commandList(profile, preset) {
  const customCommands = splitItems(profile.commands);
  return customCommands.length ? customCommands.map((item) => `\`${item}\``) : preset.commands;
}

function agentsMd(profile) {
  const preset = getPreset(profile.type);
  const date = today();
  const commands = commandList(profile, preset);
  const specialRules = splitItems(profile.rules);

  return `# AGENTS.md - ${profile.name}

## Purpose of This File

This file is the persistent operating manual and handoff document for AI coding agents working on this project.

The project owner may switch between AI coding assistants, local tools, and fresh chat sessions. Therefore, no AI should assume conversation history is available.

Core rule: never rely on chat memory for project state. Record important decisions, progress, errors, fixes, experiments, and unfinished work in the repository.

## Project Mission

${projectMission(profile)}

## Project Profile

- Project type: ${preset.label}
- Baseline stack: ${stackLine(profile)}
- Generated: ${date}

Update this section when the project direction or stack changes.

${optionalListSection("Planned Features", profile.features, "- Replace this with the main features the project should deliver.")}

${optionalListSection("Expected Project Structure", profile.structure, "- Replace this with the intended folders, files, apps, packages, or services.")}

## Non-Negotiable Rules

- Read this file before changing code.
- Inspect the actual implementation before proposing or making changes.
- Do not assume current API, package, framework, platform, or provider behavior when the information may have changed.
- For version-sensitive behavior, verify against official documentation or primary sources.
- State when something is an inference rather than a confirmed fact.
- Do not silently replace real behavior with mock/sample data in user-facing flows.
- Mock data is allowed only when clearly isolated for tests, fixtures, or explicit demo states.
- Do not overwrite working implementation without understanding why it exists.
- Do not delete contextual docs, logs, failed attempts, or handoff notes just to make the repository cleaner.
${specialRules.length ? specialRules.map((rule) => `- ${rule}`).join("\n") : ""}

## Mandatory First-Run Procedure

Before changing code, every AI must:

${numbered([
    "Read `AGENTS.md` completely or at least all sections relevant to the task.",
    "Read `CLAUDE.md` when using Claude or Claude-compatible tooling.",
    "Read `PROJECT_BRIEF.md`.",
    "Inspect the current Git branch and working tree.",
    "Inspect recent commits when the repository has Git history.",
    "Read `logs/handoff.md`.",
    "Read the latest entries in `logs/progress.md`.",
    "Read `docs/decisions.md` if the task involves architecture or technology choices.",
    "Read `logs/errors.md` if the task touches an area with known problems.",
    "Inspect the actual current implementation before editing.",
    "Verify current external documentation for APIs, packages, providers, or platform behavior that may have changed."
  ])}

Never assume a file exists because an earlier AI said it existed. Check the repository.

## Choosing the Right Approach

AI defaults to the most common solution in its training data. The most common solution usually works, but it is often not the best fit for this project. "It technically works" is not the goal; "it works well for this project's real constraints" is.

${optionalListSection("Project Constraints and Context", profile.constraints, "- Replace this with context an AI cannot infer: target hardware (GPU, CPU, RAM), performance/latency targets, security sensitivity, expected lifespan (one-off script vs long-lived tool), and approaches the owner prefers or wants avoided.").replace(/^## /, "### ")}
Before implementing a non-trivial technical choice (API, algorithm, library, protocol, storage, or OS integration):

${numbered([
    "Re-read the constraints above and the purpose of the feature in `PROJECT_BRIEF.md`. Know *why* the feature exists, not only *what* was asked.",
    "Consider more than the first familiar option. Ask: is there a newer, faster, less invasive, or hardware-accelerated alternative that fits these constraints?",
    "Read the Remarks, warnings, and \"recommended alternative\" notes in the official docs, not only the function signature. Official docs often say when *not* to use an API.",
    "Prefer the least invasive mechanism that meets the need: observe instead of intercept, read instead of write, async instead of blocking, scoped instead of global.",
    "Match strength to purpose: use security-grade tools where security matters, and faster/lighter tools where it does not. Look for cheap pre-checks that skip expensive work entirely.",
    "Consider hidden costs that do not show up in a quick test: latency, blocking/freezing behavior, resource use, failure modes, security exposure, and maintenance burden.",
    "When real options exist, present them briefly as \"use A when..., use B when...\" with a recommendation for this project. Do not bury the choice in exhaustive detail.",
    "Record the choice and the rejected alternatives in `docs/decisions.md`."
  ])}

If the purpose or constraints are unclear and the choice materially changes the result, ask the owner instead of silently picking the generic default.

## Repository Documentation Structure

Maintain this structure as the project grows:

\`\`\`text
docs/
  architecture.md
  decisions.md
  security.md
  testing.md
  troubleshooting.md
  known-issues.md
logs/
  progress.md
  errors.md
  experiments.md
  handoff.md
\`\`\`

Create missing files when needed. Do not create unnecessary documentation for trivial changes, but important work must be recorded.

## Progress Logging

After meaningful work, update \`logs/progress.md\`.

Each entry should answer:

- What was worked on?
- What changed?
- Why was it changed?
- What was verified?
- What remains unfinished?
- What should the next AI do?

Use concise entries, but include enough detail that a new AI can continue without repeating investigation.

## Error and Fix Logging

Record significant errors in \`logs/errors.md\`.

Include:

- Date
- Area
- Symptoms
- Environment
- Exact relevant error text
- Root cause
- Failed attempts
- Working fix
- Verification
- Related files
- Status: \`OPEN\` or \`RESOLVED\`

Do not mark a problem resolved until the fix has been tested.

## Decision Log

Record important architecture, dependency, platform, data-flow, persistence, and security decisions in \`docs/decisions.md\`.

Use this shape:

\`\`\`markdown
## ADR-001 - Short decision title

### Decision
What was decided.

### Context
Why the decision was needed.

### Alternatives considered
- Option A
- Option B

### Why this was selected
Explain the tradeoff.

### Revisit when
What evidence would justify changing it.
\`\`\`

Do not silently change major architecture. Document the change first or immediately after the change.

## Handoff Rules

Update \`logs/handoff.md\` at the end of major work sessions.

It should always show:

- Current branch
- Last verified build/test
- Current phase
- Working features
- In progress
- Broken or risky areas
- Last change
- Last test
- Known blockers
- Recommended next task
- Files most relevant to the next task

## Git Workflow

- Keep commits focused and descriptive.
- Do not commit dependencies, generated caches, local build output, logs from tools, archives, or large binary artifacts unless the project explicitly tracks them.
- Do not rewrite history or reset work unless the project owner explicitly asks.
- Do not revert unrelated dirty worktree changes.
- Run relevant verification before committing.
- Record the commit hash in \`logs/handoff.md\` after an important committed checkpoint.

## Verification Rules

${list(preset.verification)}

Useful commands for this preset:

${list(commands)}

Replace placeholder commands with real project commands once the stack is initialized.

## Architecture Rules

${list(preset.architecture)}

## Security Rules

${list(preset.security)}

## UI Rules

- Build the actual working product surface first, not a marketing landing page, unless the task is explicitly marketing.
- Keep workflows practical, clear, and efficient for repeated use.
- Use visible instructional text sparingly and only where it helps the user complete the task.
- Verify that UI text does not overflow at desktop and mobile widths.
- Keep accessibility, keyboard behavior, loading states, empty states, and error states in scope for user-facing work.

## When Fixing Bugs

Use this cycle:

\`\`\`text
Observe -> Reproduce -> Capture evidence -> Identify root cause -> Make the smallest reasonable fix -> Test -> Record result
\`\`\`

Do not rewrite an entire subsystem because of one error until the root cause is understood.

## Failed Approaches

When an approach fails, document it in \`logs/experiments.md\`, \`logs/errors.md\`, or \`docs/decisions.md\`.

Include:

- Why it was attempted
- What failed
- Evidence
- Why it was rejected
- When it should be reconsidered

## Session-End Procedure

At the end of meaningful work:

${numbered([
    "Verify the project state.",
    "Run relevant tests/builds.",
    "Update `logs/progress.md`.",
    "Update `logs/errors.md` for new significant issues.",
    "Update `docs/decisions.md` for architectural choices.",
    "Update `logs/experiments.md` for benchmarks or experiments.",
    "Update `logs/handoff.md` with the exact stopping point.",
    "Commit when appropriate and allowed by the owner."
  ])}

## Current Project Status

### Current Phase

Project starter generated. Replace this with the actual project phase.

### Working Features

- Project memory structure exists.
- AI operating instructions exist.

### In Progress

- Project implementation planning.

### Not Yet Implemented

- Replace this list with real project features.

### Known Risks

- External API, framework, package, or platform behavior may change over time.
- Missing verification commands can cause agents to assume success without evidence.
- Sparse handoff notes can make future sessions repeat work.

## Definition of Done

A feature is complete only when:

- Implementation exists.
- The chosen approach fits the documented project constraints, not only the most common approach, and meaningful tradeoffs are recorded.
- Relevant tests exist or testing is explicitly documented as not practical.
- Build/check commands pass where available.
- The real user-facing or developer-facing path is verified.
- Errors are handled.
- Important limitations are documented.
- Progress is logged.
- Handoff state is updated.

## Fast Start for a New AI Chat

\`\`\`text
1. Read AGENTS.md.
2. Read CLAUDE.md if using Claude.
3. Read PROJECT_BRIEF.md.
4. Read logs/handoff.md.
5. Read latest logs/progress.md entries.
6. Inspect git status and recent commits.
7. Inspect relevant source files.
8. Make the requested change.
9. Test it.
10. Log the result.
11. Update handoff.md.
\`\`\`

## Golden Rules

${numbered([
    "Read before editing.",
    "Verify assumptions against current official sources.",
    "Choose the best-fit approach for this project, not the most common one.",
    "Do not trust chat history to preserve project state.",
    "Write important knowledge into the repository.",
    "Log errors and their real fixes.",
    "Record failed approaches.",
    "Use small, understandable changes.",
    "Test the real affected path.",
    "Do not silently change architecture.",
    "Protect secrets, user data, and local machine state.",
    "Leave the project ready for another AI to continue."
  ])}
`;
}

function claudeMd(profile) {
  const preset = getPreset(profile.type);
  const commands = commandList(profile, preset);
  const specialRules = splitItems(profile.rules);

  return `# CLAUDE.md - ${profile.name}

You are working on ${profile.name}.

## Start Here

Before changing code:

1. Read \`AGENTS.md\`.
2. Read \`PROJECT_BRIEF.md\`.
3. Read \`logs/handoff.md\`.
4. Read the latest entries in \`logs/progress.md\`.
5. Inspect the current implementation and Git status.

Do not rely on chat history for project state. The repository is the source of truth.

## Project Profile

- Type: ${preset.label}
- Stack: ${stackLine(profile)}

${optionalListSection("Planned Features", profile.features, "- See `PROJECT_BRIEF.md` and `AGENTS.md`.")}

## Core Behavior

- Keep changes small and grounded in the existing code.
- Verify current documentation for version-sensitive APIs, packages, platforms, or providers.
- Do not default to the most common solution. Check the project constraints in \`AGENTS.md\` and pick the best fit; when real alternatives exist, state briefly when each applies and recommend one.
- Do not introduce mock data into real user-facing flows unless it is explicitly isolated as a demo or test fixture.
- Do not delete docs, logs, decisions, failed attempts, or handoff notes.
- Update project memory files after meaningful work.
${specialRules.length ? specialRules.map((rule) => `- ${rule}`).join("\n") : ""}

## Verification

${list(preset.verification)}

## Known Commands

${list(commands)}

## Required Closeout

After meaningful work, update:

- \`logs/progress.md\`
- \`logs/handoff.md\`
- \`logs/errors.md\` if a significant problem was encountered
- \`docs/decisions.md\` if architecture, dependency, security, or data-flow decisions changed
`;
}

function projectBrief(profile) {
  const preset = getPreset(profile.type);

  return `# Project Brief - ${profile.name}

## Mission

${projectMission(profile)}

## Profile

- Type: ${preset.label}
- Stack: ${stackLine(profile)}
- Generated: ${today()}

${optionalListSection("Planned Features", profile.features, "- Add the main user-facing and developer-facing features here.")}

${optionalListSection("Expected Structure", profile.structure, "- Add intended folders, files, packages, services, or apps here.")}

${optionalListSection("Constraints and Context", profile.constraints, "- Add what an AI cannot guess: target hardware, performance targets, security needs, expected lifespan, and preferred or forbidden approaches.")}

## Success Criteria

- The project can be understood from repository files without chat history.
- Important implementation decisions are documented.
- Build, test, and verification commands are known.
- Fresh AI sessions can read the handoff and continue safely.

## Notes

Replace this file with the real project brief as planning becomes more specific.
`;
}

function architectureDoc(profile) {
  const structure = splitItems(profile.structure);

  return `# Architecture

## Overview

Describe the main modules, data flow, runtime boundaries, and ownership rules for ${profile.name}.

## Current Shape

${structure.length ? list(structure) : list([
    "Entry points:",
    "Core modules:",
    "Shared services:",
    "Persistence:",
    "External APIs:",
    "Runtime/platform integrations:"
  ])}

## Boundaries

Document what each major layer is allowed to know about.

## Open Questions

- What architecture choices still need evidence?
- What parts are intentionally temporary?
`;
}

function decisionsDoc() {
  return `# Decisions

Record important architecture, dependency, data-flow, platform, and security decisions here.

## ADR-001 - Project memory files

### Decision

Use \`AGENTS.md\`, \`CLAUDE.md\`, \`PROJECT_BRIEF.md\`, \`docs/\`, and \`logs/\` as persistent project memory.

### Context

AI assistants and chat sessions may change over time. The repository needs enough context for a new session to continue safely.

### Alternatives considered

- Keep context only in chat.
- Keep a single short README.

### Why this was selected

Repository-local memory is inspectable, versionable, and available to every assistant and developer.

### Revisit when

Revisit if the project adopts a different documented knowledge-management workflow.
`;
}

function securityDoc(profile) {
  const preset = getPreset(profile.type);

  return `# Security

## Baseline Rules

${list(preset.security)}

## Secrets

Document required environment variables and where they are allowed to exist. Never commit real secrets.

## Trust Boundaries

- User input:
- Filesystem:
- Network:
- External APIs:
- Build/deployment:

## Known Risks

- Replace this list as implementation details become clear.
`;
}

function testingDoc(profile) {
  const preset = getPreset(profile.type);
  const commands = commandList(profile, preset);

  return `# Testing

## Verification Commands

${list(commands)}

## Required Checks

${list(preset.verification)}

## Manual Test Matrix

- Primary happy path:
- Error path:
- Empty/loading state:
- Permission/auth state:
- Regression cases:

## Last Known Good

- Date:
- Commit:
- Commands run:
- Manual checks:
`;
}

function troubleshootingDoc() {
  return `# Troubleshooting

Record recurring setup, build, runtime, deployment, and platform problems here.

## Known Issues

Link to detailed entries in \`logs/errors.md\` where possible.
`;
}

function knownIssuesDoc() {
  return `# Known Issues

Track unresolved bugs, limitations, and risky areas here.

## Open

- None recorded yet.

## Resolved

- None recorded yet.
`;
}

function androidPlatformNotesDoc(profile) {
  return `# Android Platform Notes - ${profile.name}

## Baseline

This project is a pure Kotlin Android Studio app.

Core platform areas that must be verified against current official Android documentation before implementation changes:

- Runtime permissions
- Package visibility declarations
- Foreground service types and permissions
- WorkManager behavior
- Notification requirements
- Storage Access Framework
- Assistant role eligibility
- VoiceInteractionService requirements
- AccessibilityService policy limits
- Termux RUN_COMMAND intent behavior, if the optional bridge is enabled

## Assistant-Like Integration

Start with ordinary app entry points, shortcuts, and deep links before attempting assistant-role behavior.

If system assistant behavior is explored:

- Use Android RoleManager only when the role is available and the app qualifies.
- VoiceInteractionService must declare the required service interface and binding permission.
- Record the exact Android versions, devices, and docs checked.

## Background Work

Use WorkManager for persistent background work that must survive app exits or reboot.

Use foreground services only when the task genuinely requires them, and declare the correct foreground service type and permissions for the target SDK.

## Accessibility Boundary

Do not rely on AccessibilityService for general autonomous app control. Treat broad app automation through accessibility as prohibited unless the feature is genuinely an accessibility tool for users with disabilities and complies with Google Play policy.

## Termux Boundary

Termux is optional developer-mode integration, not the app foundation.

The app must not assume unrestricted shell access. Android app sandboxing still applies.
`;
}

function litellmArchitectureDoc(profile) {
  return `# LiteLLM Agent Architecture - ${profile.name}

## Bottom Line

${profile.name} should use a native Android chat UI plus a Kotlin agent runtime. LiteLLM is the model gateway. Tools are exposed through controlled Kotlin functions.

## Major Components

- Chat UI: Jetpack Compose streaming chat surface, message bubbles, tool result cards, approvals, and error states.
- LiteLLM client: Kotlin HTTP client using OkHttp or Ktor against OpenAI-compatible LiteLLM endpoints.
- Agent orchestrator: planner, tool router, memory manager, approval gate, and result dispatcher.
- Tool registry: strongly typed Kotlin tools for approved actions.
- Subagents: Kotlin coroutines running parallel model calls, coordinated by a merge/synthesis step.
- Memory: Room for local conversations and project state; backend vector memory only if needed.
- Research: Prefer server-side search/crawl/fetch for reliability, quota management, and citation tracking.
- Termux bridge: optional advanced provider with explicit user setup.

## Suggested Package Boundaries

\`\`\`text
ai.oxygen.chat       Compose UI, chat state, rendering, tool result cards
ai.oxygen.agent      orchestration, planning, tool routing, approval flow
ai.oxygen.litellm    request/response models, streaming client, auth
ai.oxygen.tools      typed tool interfaces and implementations
ai.oxygen.memory     Room entities, DAOs, repositories
ai.oxygen.research   search, fetch, summarize, citation tracking
ai.oxygen.termux     optional Termux RUN_COMMAND integration
\`\`\`

## Streaming

Support streaming model responses through the LiteLLM proxy where available. Keep streaming parsing isolated in the LiteLLM client layer so the chat UI receives typed events rather than raw network chunks.

## Tool Calling Flow

\`\`\`text
model request -> typed tool call -> validate -> require approval if risky -> execute -> capture result -> return result to model
\`\`\`

Never let the model directly execute arbitrary shell commands or Android intents.

## Subagents

Use Kotlin coroutines for concurrent model calls. Each subagent should have:

- a bounded task
- timeout and cancellation
- output limits
- structured result format
- coordinator review before final answer

## Memory

Use Room for local durable state:

- conversations
- messages
- tool calls
- tool results
- approvals
- citations
- user preferences

Do not store secrets in plain Room tables.
`;
}

function termuxBridgeDoc(profile) {
  return `# Optional Termux Bridge - ${profile.name}

## Role

Termux is an optional advanced integration for developer-mode users. It is not required for normal chat, research, memory, or Android device tools.

## Required User Setup

Termux command execution from another app requires user consent and Termux configuration.

Expected requirements:

- Termux installed.
- App requests \`com.termux.permission.RUN_COMMAND\`.
- User grants the permission.
- Termux has \`allow-external-apps=true\` in \`~/.termux/termux.properties\`.
- App declares package visibility for Termux when targeting Android 11+.

Verify these requirements against current Termux and Android documentation before implementation.

## Safety Rules

- Keep this feature disabled by default.
- Use an explicit command allowlist.
- Require confirmation for risky commands.
- Apply timeouts.
- Limit stdout and stderr size.
- Capture exit code.
- Never pass raw model text directly to Termux.
- Never present Termux as unrestricted root or system shell access.

## Result Shape

Termux results should be converted into a typed result:

\`\`\`text
commandId
command
args
exitCode
stdoutPreview
stderrPreview
durationMs
status
truncated
\`\`\`

## Non-Goals

- No arbitrary remote shell.
- No bypassing Android sandboxing.
- No hidden background command execution.
- No dependency on Termux for core app functionality.
`;
}

function toolSafetyDoc(profile) {
  return `# Tool Safety - ${profile.name}

## Core Rule

Never let the model directly perform high-impact actions. The model may request a typed tool call; Kotlin code decides whether the tool exists, whether arguments are valid, whether approval is required, and how execution is bounded.

## Tool Request Flow

\`\`\`text
LiteLLM response
  -> parse typed tool request
  -> validate schema
  -> check allowlist and permissions
  -> classify risk
  -> request user approval when needed
  -> execute Kotlin function
  -> store result
  -> return summarized result to model
\`\`\`

## Risk Classes

- Low: read-only app-local state, summarize current conversation, format text.
- Medium: web fetch, note creation, notification creation, file read from user-selected URI.
- High: file write/delete, external intents, contact/calendar changes, location access, Termux command execution.

High-risk tools require explicit user approval and clear visible result reporting.

## Tool Registry Requirements

Each tool should define:

- stable tool name
- typed input schema
- typed output schema
- permission requirements
- risk class
- timeout
- output limit
- whether approval is required
- audit log behavior

## Prohibited Defaults

- No arbitrary shell command tool.
- No arbitrary URL proxy tool without host checks.
- No hidden contact, calendar, file, location, camera, or microphone access.
- No AccessibilityService automation for general app control.
`;
}

function progressLog(profile) {
  const features = splitItems(profile.features);
  const structure = splitItems(profile.structure);

  return `# Progress Log

## ${today()} - Project memory scaffold

### Worked on

Generated starter AI project memory files for ${profile.name}.

### Changed

- Added \`AGENTS.md\`.
- Added \`CLAUDE.md\`.
- Added \`PROJECT_BRIEF.md\`.
- Added starter \`docs/\` files.
- Added starter \`logs/\` files.
${features.length ? "- Captured planned feature list from the project profile." : ""}
${structure.length ? "- Captured expected project structure from the project profile." : ""}

### Verification

- Generator completed file creation.

### Remaining

- Replace placeholders with project-specific implementation details.
- Add real build, test, and run commands after the stack is initialized.

### Next AI

Read \`AGENTS.md\`, inspect the current codebase, and update project status before making feature changes.
`;
}

function errorsLog() {
  return `# Error Log

Record significant errors and fixes here.

## Template

### Date

YYYY-MM-DD

### Area

Affected subsystem.

### Symptoms

What failed.

### Environment

- OS:
- Runtime:
- Framework:
- Relevant versions:

### Error

\`\`\`text
Paste relevant error text here.
\`\`\`

### Root Cause

Explain the actual cause.

### Failed Attempts

1. Attempt - why it failed.

### Working Fix

What changed.

### Verification

How the fix was tested.

### Related Files

- \`path/to/file\`

### Status

OPEN
`;
}

function experimentsLog() {
  return `# Experiments

Record benchmarks, prototypes, failed approaches, and comparison results here.

## Template

### Date

YYYY-MM-DD

### Question

What was tested?

### Setup

- Environment:
- Inputs:
- Versions:

### Result

What happened?

### Conclusion

What should future work do with this result?
`;
}

function handoffLog(profile) {
  const features = splitItems(profile.features);

  return `# Current Handoff

## Current Branch

Unknown. Inspect Git status.

## Last Verified Build

Not verified yet.

## Current Phase

Project memory scaffold generated for ${profile.name}.

## Working Features

- Starter AI documentation structure exists.

## In Progress

- Project-specific implementation details need to be filled in.
${features.length ? features.map((feature) => `- Planned: ${feature}`).join("\n") : ""}

## Broken

- Nothing recorded yet.

## Last Change

Generated project starter files.

## Last Test

Generator file creation only.

## Known Blockers

- Real build/test commands are not documented yet.

## Recommended Next Task

Initialize or inspect the real project stack, then replace placeholder commands and status sections.

## Files Most Relevant to Next Task

- \`AGENTS.md\`
- \`CLAUDE.md\`
- \`PROJECT_BRIEF.md\`
- \`docs/architecture.md\`
- \`docs/testing.md\`
`;
}

function gitignore() {
  return `# Dependencies
node_modules/
vendor/

# Build output
dist/
build/
out/
.next/
target/

# Logs and caches
*.log
.cache/
.turbo/
.vite/

# Environment and secrets
.env
.env.*
!.env.example
*.pem
*.key

# OS/editor
.DS_Store
Thumbs.db
.idea/
.vscode/

# Local artifacts
*.zip
*.tar
*.tgz
`;
}

function filesForProfile(profile) {
  const files = {
    "AGENTS.md": agentsMd(profile),
    "CLAUDE.md": claudeMd(profile),
    "PROJECT_BRIEF.md": projectBrief(profile),
    "docs/architecture.md": architectureDoc(profile),
    "docs/decisions.md": decisionsDoc(profile),
    "docs/security.md": securityDoc(profile),
    "docs/testing.md": testingDoc(profile),
    "docs/troubleshooting.md": troubleshootingDoc(profile),
    "docs/known-issues.md": knownIssuesDoc(profile),
    "logs/progress.md": progressLog(profile),
    "logs/errors.md": errorsLog(),
    "logs/experiments.md": experimentsLog(),
    "logs/handoff.md": handoffLog(profile),
    ".gitignore": gitignore()
  };

  if (profile.type === "android") {
    files["docs/android-platform-notes.md"] = androidPlatformNotesDoc(profile);
    files["docs/litellm-agent-architecture.md"] = litellmArchitectureDoc(profile);
    files["docs/termux-bridge.md"] = termuxBridgeDoc(profile);
    files["docs/tool-safety.md"] = toolSafetyDoc(profile);
  }

  return files;
}

module.exports = {
  filesForProfile
};
