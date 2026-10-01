const PRESETS = {
  generic: {
    label: "Generic software project",
    verification: [
      "Run the project-specific build command before calling implementation complete.",
      "Run relevant tests after logic, parsing, persistence, integration, or workflow changes.",
      "Run lint/static analysis where the project provides it.",
      "Verify the actual user-facing or developer-facing path affected by the change.",
      "Record what was verified in `logs/progress.md`."
    ],
    architecture: [
      "Keep behavior separated from presentation, command-line glue, and persistence.",
      "Prefer typed or structured interfaces over ad hoc string contracts.",
      "Make new capabilities composable instead of hardcoding them into unrelated modules.",
      "Keep cross-cutting concerns such as logging, configuration, and validation centralized.",
      "Document major architecture changes in `docs/decisions.md`."
    ],
    security: [
      "Treat user input, file paths, network data, and generated content as untrusted.",
      "Do not commit secrets, tokens, private keys, `.env` files, local databases, or build artifacts.",
      "Validate paths before reading, writing, deleting, or passing them to external tools.",
      "Avoid broad command execution surfaces.",
      "Document any intentional security tradeoff before shipping it."
    ],
    commands: [
      "`<build command>`",
      "`<test command>`",
      "`<lint command>`"
    ]
  },
  web: {
    label: "Web application",
    verification: [
      "Run `npm run build` after TypeScript, routing, server, API, or bundling changes.",
      "Run `npm test` or the nearest available test command after logic changes.",
      "Run `npm run lint` when available after UI, API, or shared-library changes.",
      "Verify changed user flows in a browser at desktop and mobile widths.",
      "For data changes, verify the rendered UI uses the intended backend/source of truth."
    ],
    architecture: [
      "Keep UI components focused on rendering state and dispatching actions.",
      "Keep database/API access in server routes, loaders, actions, or service modules.",
      "Do not duplicate business rules across unrelated client components.",
      "Use shared schema/types for API contracts when the stack supports it.",
      "Document important data-flow decisions in `docs/architecture.md` or `docs/decisions.md`."
    ],
    security: [
      "Never expose server-only credentials to client bundles.",
      "Validate and authorize all server route inputs.",
      "Keep redirects constrained to relative paths or approved hosts.",
      "Do not disable TLS verification.",
      "Rate-limit expensive public routes when the project exposes them."
    ],
    commands: [
      "`npm install`",
      "`npm run dev`",
      "`npm run build`",
      "`npm test`",
      "`npm run lint`"
    ]
  },
  android: {
    label: "Android application",
    verification: [
      "Build the relevant Android module before calling code complete.",
      "Run affected unit tests and instrumentation tests where practical.",
      "Run lint/static analysis for platform, permission, lifecycle, and UI changes.",
      "Verify device-dependent behavior on physical Android hardware.",
      "Record Android version, device, API level, and test outcome for platform-sensitive work."
    ],
    architecture: [
      "Keep platform APIs behind focused adapters or services.",
      "Keep UI state separate from long-running process, networking, or storage handles.",
      "Use lifecycle-aware APIs for activities, services, receivers, and Compose state.",
      "Document protocol, persistence, permission, and background-execution decisions.",
      "Do not add dependencies without a reason recorded in project docs."
    ],
    security: [
      "Use supported Android storage and permission APIs.",
      "Validate all incoming intents, file metadata, paths, and network payloads.",
      "Do not permanently disable TLS, certificate checks, or identity validation.",
      "Never log private keys, tokens, auth secrets, or unnecessary sensitive file data.",
      "Check current official Android documentation for permission and background execution behavior."
    ],
    commands: [
      "`./gradlew build`",
      "`./gradlew test`",
      "`./gradlew lint`",
      "Android Studio device run"
    ]
  },
  desktop: {
    label: "Desktop application",
    verification: [
      "Run the frontend build after TypeScript, UI, bundler, or shared logic changes.",
      "Run the desktop packaging/build command after native-shell, sidecar, permission, or installer changes.",
      "Run relevant tests after runtime, process, parser, queue, or filesystem changes.",
      "Verify the real desktop user flow, not only helper functions.",
      "For sidecars or external binaries, verify the actual packaged path and permissions."
    ],
    architecture: [
      "Keep UI components separate from filesystem, process, and OS integration logic.",
      "Build command invocations with argument arrays, not shell-concatenated user input.",
      "Keep live process handles in a runtime/process manager layer.",
      "Keep tool-specific behavior under focused modules with shared interfaces.",
      "For OS integration (input, hooks, hotkeys, file watching), use the least invasive API that meets the need: observe-only APIs before intercepting ones, and dedicated APIs (for example a hotkey API) before general hooks.",
      "Never do slow work inside blocking OS callbacks; hand it to a worker thread and return immediately so the rest of the system is not stalled.",
      "Document sidecars, permissions, packaging assumptions, and update behavior."
    ],
    security: [
      "Validate paths and URLs before passing them to OS APIs or sidecar binaries.",
      "Keep shell/process permissions scoped to known commands.",
      "Do not add arbitrary command execution from the frontend.",
      "Treat CLI output, metadata, and downloaded files as untrusted input.",
      "Do not commit generated caches, local binaries, downloaded media, or build artifacts."
    ],
    commands: [
      "`npm install`",
      "`npm run dev`",
      "`npm run build`",
      "`npm test`",
      "`npm run tauri -- dev` or equivalent desktop-shell command"
    ]
  }
};

function getPreset(type) {
  return PRESETS[type] || PRESETS.generic;
}

function listPresetTypes() {
  return Object.keys(PRESETS);
}

module.exports = {
  PRESETS,
  getPreset,
  listPresetTypes
};
