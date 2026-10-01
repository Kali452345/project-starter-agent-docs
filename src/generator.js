const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const { filesForProfile } = require("./templates");
const { listPresetTypes } = require("./presets");

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    command: args[0] && !args[0].startsWith("-") ? args[0] : "init",
    name: "",
    type: "generic",
    stack: "",
    description: "",
    structure: "",
    features: "",
    commands: "",
    rules: "",
    constraints: "",
    output: ".",
    force: false,
    dryRun: false,
    help: false
  };

  const start = options.command === args[0] ? 1 : 0;

  for (let index = start; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--name" || arg === "-n") {
      options.name = next || "";
      index += 1;
    } else if (arg === "--type" || arg === "-t") {
      options.type = next || "generic";
      index += 1;
    } else if (arg === "--stack" || arg === "-s") {
      options.stack = next || "";
      index += 1;
    } else if (arg === "--description" || arg === "-d") {
      options.description = next || "";
      index += 1;
    } else if (arg === "--structure") {
      options.structure = next || "";
      index += 1;
    } else if (arg === "--features") {
      options.features = next || "";
      index += 1;
    } else if (arg === "--commands") {
      options.commands = next || "";
      index += 1;
    } else if (arg === "--rules") {
      options.rules = next || "";
      index += 1;
    } else if (arg === "--constraints") {
      options.constraints = next || "";
      index += 1;
    } else if (arg === "--output" || arg === "-o") {
      options.output = next || ".";
      index += 1;
    } else if (arg === "--force" || arg === "-f") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!listPresetTypes().includes(options.type)) {
    throw new Error(`Unknown project type "${options.type}". Use one of: ${listPresetTypes().join(", ")}`);
  }

  return options;
}

function usage() {
  return `Project Starter Agent Docs

Usage:
  project-starter init [options]

Options:
  -n, --name <name>              Project name
  -t, --type <type>              generic, web, android, desktop
  -s, --stack <stack>            Stack description
  -d, --description <text>       Project mission/description
      --structure <items>        Planned folders/files, separated by comma or semicolon
      --features <items>         Planned features, separated by comma or semicolon
      --commands <items>         Project commands, separated by comma or semicolon
      --rules <items>            Special AI/project rules, separated by comma or semicolon
      --constraints <items>      Context an AI cannot guess: hardware, performance, security, preferred/avoided approaches
  -o, --output <path>            Output directory, default "."
  -f, --force                    Overwrite existing files
      --dry-run                  Print files that would be written
  -h, --help                     Show help

Examples:
  node ./bin/project-starter.js init --name "MovieAura" --type web --stack "Next.js, Supabase"
  node ./bin/project-starter.js init --name "Transfer App" --type android --output ./out/transfer-app
  node ./bin/project-starter.js init --name "Agent Docs" --features "Generate AGENTS.md, Generate CLAUDE.md" --structure "src/, docs/, logs/"
`;
}

async function promptForMissing(options) {
  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  if (!interactive) {
    return options;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const name = options.name || await rl.question("Project name: ");
    const type = options.type !== "generic"
      ? options.type
      : await rl.question(`Project type (${listPresetTypes().join("/")}) [generic]: `);
    const stack = options.stack || await rl.question("Stack [optional]: ");
    const description = options.description || await rl.question("Project mission [optional]: ");
    const features = options.features || await rl.question("Main features, comma-separated [optional]: ");
    const structure = options.structure || await rl.question("Planned folders/files, comma-separated [optional]: ");
    const commands = options.commands || await rl.question("Known commands, comma-separated [optional]: ");
    const rules = options.rules || await rl.question("Special AI/project rules, comma-separated [optional]: ");
    const constraints = options.constraints || await rl.question("Constraints/context (hardware, performance, security, preferred or avoided approaches), comma-separated [optional]: ");
    const target = options.output !== "."
      ? options.output
      : await rl.question("Output directory [.] : ");

    return {
      ...options,
      name: name.trim(),
      type: type.trim() || options.type,
      stack: stack.trim(),
      description: description.trim(),
      features: features.trim(),
      structure: structure.trim(),
      commands: commands.trim(),
      rules: rules.trim(),
      constraints: constraints.trim(),
      output: target.trim() || options.output
    };
  } finally {
    rl.close();
  }
}

function ensureProfile(options) {
  if (!options.name || !options.name.trim()) {
    throw new Error("Project name is required. Pass --name or run interactively.");
  }

  if (!listPresetTypes().includes(options.type)) {
    throw new Error(`Unknown project type "${options.type}". Use one of: ${listPresetTypes().join(", ")}`);
  }

  return {
    name: options.name.trim(),
    type: options.type,
    stack: options.stack.trim(),
    description: options.description.trim(),
    structure: options.structure.trim(),
    features: options.features.trim(),
    commands: options.commands.trim(),
    rules: options.rules.trim(),
    constraints: options.constraints.trim()
  };
}

function writeGeneratedFiles(profile, options) {
  const files = filesForProfile(profile);
  const root = path.resolve(process.cwd(), options.output);
  const result = {
    root,
    written: [],
    skipped: []
  };

  if (options.dryRun) {
    result.written = Object.keys(files);
    return result;
  }

  fs.mkdirSync(root, { recursive: true });

  for (const [relativePath, contents] of Object.entries(files)) {
    const target = path.join(root, relativePath);

    if (fs.existsSync(target) && !options.force) {
      result.skipped.push(relativePath);
      continue;
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents, "utf8");
    result.written.push(relativePath);
  }

  return result;
}

function printResult(result, options) {
  if (options.dryRun) {
    console.log(`Would write ${result.written.length} files to ${result.root}:`);
  } else {
    console.log(`Wrote ${result.written.length} files to ${result.root}:`);
  }

  for (const file of result.written) {
    console.log(`  + ${file}`);
  }

  if (result.skipped.length) {
    console.log(`Skipped ${result.skipped.length} existing files. Use --force to overwrite:`);
    for (const file of result.skipped) {
      console.log(`  - ${file}`);
    }
  }
}

async function runCli(argv) {
  let options = parseArgs(argv);

  if (options.help) {
    console.log(usage());
    return;
  }

  if (options.command !== "init") {
    throw new Error(`Unknown command: ${options.command}`);
  }

  options = await promptForMissing(options);
  const profile = ensureProfile(options);
  const result = writeGeneratedFiles(profile, options);
  printResult(result, options);
}

module.exports = {
  parseArgs,
  writeGeneratedFiles,
  runCli
};
