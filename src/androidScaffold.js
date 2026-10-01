const fs = require("fs");
const path = require("path");

function parseAndroidArgs(argv) {
  const args = argv.slice(2);
  const options = {
    name: "Oxygen Ai",
    packageName: "ai.oxygen",
    output: ".",
    sdkDir: "",
    force: false,
    help: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--name" || arg === "-n") {
      options.name = next || options.name;
      index += 1;
    } else if (arg === "--package" || arg === "-p") {
      options.packageName = next || options.packageName;
      index += 1;
    } else if (arg === "--output" || arg === "-o") {
      options.output = next || options.output;
      index += 1;
    } else if (arg === "--sdk-dir") {
      options.sdkDir = next || "";
      index += 1;
    } else if (arg === "--force" || arg === "-f") {
      options.force = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function usage() {
  return `Android app scaffold

Usage:
  node ./bin/scaffold-android-app.js --output <project-folder> [options]

Options:
  -n, --name <name>        App/project name
  -p, --package <name>     Android package name, default ai.oxygen
  -o, --output <path>      Project folder
      --sdk-dir <path>     Optional Android SDK path for local.properties
  -f, --force              Overwrite scaffold files
  -h, --help               Show help
`;
}

function packagePath(packageName) {
  return packageName.split(".").join("/");
}

function androidFiles(options) {
  const pkg = options.packageName;
  const pkgPath = packagePath(pkg);
  const appNameNoSpaces = options.name.replace(/\s+/g, "");
  const sdkDir = options.sdkDir ? options.sdkDir.replace(/\\/g, "\\\\") : "";

  const files = {
    "settings.gradle.kts": `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${appNameNoSpaces}"
include(":app")
`,
    "build.gradle.kts": `plugins {
    id("com.android.application") version "8.13.2" apply false
    id("org.jetbrains.kotlin.android") version "2.2.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.2.21" apply false
}
`,
    "gradle.properties": `org.gradle.jvmargs=-Xmx4096m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`,
    "app/build.gradle.kts": `import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "${pkg}"
    compileSdk = 36

    defaultConfig {
        applicationId = "${pkg}"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.12.00"))
    implementation("androidx.core:core-ktx:1.17.0")
    implementation("androidx.activity:activity-compose:1.11.0")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.4")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("com.squareup.okhttp3:okhttp:5.3.2")
    implementation("androidx.work:work-runtime-ktx:2.11.2")
    implementation("androidx.room:room-runtime:2.8.4")
    implementation("androidx.room:room-ktx:2.8.4")

    debugImplementation("androidx.compose.ui:ui-tooling")
}
`,
    "app/proguard-rules.pro": `# Add project-specific keep rules here when release minification is enabled.
`,
    "app/src/main/AndroidManifest.xml": `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="com.termux.permission.RUN_COMMAND" />

    <queries>
        <package android:name="com.termux" />
    </queries>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.OxygenAi">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
    "app/src/main/res/values/strings.xml": `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${options.name}</string>
</resources>
`,
    "app/src/main/res/values/styles.xml": `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.OxygenAi" parent="android:style/Theme.Material.Light.NoActionBar">
        <item name="android:fontFamily">sans</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowNoTitle">true</item>
    </style>
</resources>
`,
    "app/src/main/res/mipmap-hdpi/ic_launcher.xml": adaptiveIconVector(),
    "app/src/main/res/mipmap-hdpi/ic_launcher_round.xml": adaptiveIconVector(),
    ["app/src/main/java/" + pkgPath + "/MainActivity.kt"]: `package ${pkg}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import ${pkg}.chat.OxygenAiApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            OxygenAiApp()
        }
    }
}
`,
    ["app/src/main/java/" + pkgPath + "/chat/ChatMessage.kt"]: `package ${pkg}.chat

data class ChatMessage(
    val id: String,
    val role: ChatRole,
    val text: String,
    val isStreaming: Boolean = false
)

enum class ChatRole {
    User,
    Assistant,
    Tool
}
`,
    ["app/src/main/java/" + pkgPath + "/chat/OxygenAiApp.kt"]: `package ${pkg}.chat

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun OxygenAiApp() {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            val messages = remember {
                mutableStateListOf(
                    ChatMessage(
                        id = "welcome",
                        role = ChatRole.Assistant,
                        text = "Oxygen Ai scaffold is ready. Configure LiteLLM before enabling real model calls."
                    )
                )
            }
            var input by remember { mutableStateOf("") }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Oxygen Ai",
                    style = MaterialTheme.typography.headlineMedium
                )
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(messages, key = { it.id }) { message ->
                        MessageCard(message)
                    }
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = input,
                        onValueChange = { input = it },
                        modifier = Modifier.weight(1f),
                        placeholder = { Text("Message Oxygen Ai") }
                    )
                    Button(
                        onClick = {
                            val text = input.trim()
                            if (text.isNotEmpty()) {
                                messages.add(ChatMessage("user-" + messages.size, ChatRole.User, text))
                                messages.add(
                                    ChatMessage(
                                        "assistant-" + messages.size,
                                        ChatRole.Assistant,
                                        "LiteLLM runtime is scaffolded but not configured yet."
                                    )
                                )
                                input = ""
                            }
                        }
                    ) {
                        Text("Send")
                    }
                }
            }
        }
    }
}

@Composable
private fun MessageCard(message: ChatMessage) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = message.role.name,
                style = MaterialTheme.typography.labelMedium
            )
            Text(
                text = message.text,
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}
`,
    ["app/src/main/java/" + pkgPath + "/agent/AgentRuntime.kt"]: `package ${pkg}.agent

import ${pkg}.litellm.LiteLlmClient
import ${pkg}.tools.ToolRegistry

class AgentRuntime(
    private val liteLlmClient: LiteLlmClient,
    private val toolRegistry: ToolRegistry
) {
    suspend fun submitUserMessage(message: String): AgentTurnResult {
        require(message.isNotBlank()) { "Message cannot be blank." }
        return AgentTurnResult(
            assistantText = "Runtime wiring is ready. Configure LiteLLM and connect streaming next.",
            requestedTools = emptyList()
        )
    }
}

data class AgentTurnResult(
    val assistantText: String,
    val requestedTools: List<String>
)
`,
    ["app/src/main/java/" + pkgPath + "/litellm/LiteLlmClient.kt"]: `package ${pkg}.litellm

import kotlinx.coroutines.flow.Flow

interface LiteLlmClient {
    fun streamChat(request: LiteLlmChatRequest): Flow<LiteLlmStreamEvent>
}
`,
    ["app/src/main/java/" + pkgPath + "/litellm/LiteLlmModels.kt"]: `package ${pkg}.litellm

data class LiteLlmChatRequest(
    val model: String,
    val messages: List<LiteLlmMessage>,
    val tools: List<LiteLlmToolSpec> = emptyList()
)

data class LiteLlmMessage(
    val role: String,
    val content: String
)

data class LiteLlmToolSpec(
    val name: String,
    val description: String,
    val inputSchema: String
)

sealed interface LiteLlmStreamEvent {
    data class Delta(val text: String) : LiteLlmStreamEvent
    data class ToolRequested(val name: String, val rawArguments: String) : LiteLlmStreamEvent
    data class Failed(val message: String) : LiteLlmStreamEvent
    data object Done : LiteLlmStreamEvent
}
`,
    ["app/src/main/java/" + pkgPath + "/tools/AgentTool.kt"]: `package ${pkg}.tools

interface AgentTool<I, O> {
    val name: String
    val description: String
    val risk: ToolRisk
    val requiresApproval: Boolean

    suspend fun execute(input: I): O
}
`,
    ["app/src/main/java/" + pkgPath + "/tools/ToolRegistry.kt"]: `package ${pkg}.tools

class ToolRegistry(
    tools: List<AgentTool<*, *>> = emptyList()
) {
    private val toolsByName = tools.associateBy { it.name }

    fun find(name: String): AgentTool<*, *>? = toolsByName[name]

    fun list(): List<AgentTool<*, *>> = toolsByName.values.toList()
}
`,
    ["app/src/main/java/" + pkgPath + "/tools/ToolRisk.kt"]: `package ${pkg}.tools

enum class ToolRisk {
    Low,
    Medium,
    High
}
`,
    ["app/src/main/java/" + pkgPath + "/memory/ConversationMemory.kt"]: `package ${pkg}.memory

interface ConversationMemory {
    suspend fun appendMessage(conversationId: String, role: String, content: String)
    suspend fun recentMessages(conversationId: String, limit: Int): List<StoredMessage>
}

data class StoredMessage(
    val id: String,
    val conversationId: String,
    val role: String,
    val content: String,
    val createdAtMillis: Long
)
`,
    ["app/src/main/java/" + pkgPath + "/research/ResearchModels.kt"]: `package ${pkg}.research

data class ResearchRequest(
    val query: String,
    val maxSources: Int = 5
)

data class ResearchSource(
    val title: String,
    val url: String,
    val summary: String,
    val retrievedAtMillis: Long
)

data class ResearchResult(
    val answer: String,
    val sources: List<ResearchSource>
)
`,
    ["app/src/main/java/" + pkgPath + "/termux/TermuxBridge.kt"]: `package ${pkg}.termux

data class TermuxCommandRequest(
    val commandId: String,
    val executable: String,
    val args: List<String>,
    val timeoutMillis: Long
)

data class TermuxCommandResult(
    val commandId: String,
    val exitCode: Int?,
    val stdoutPreview: String,
    val stderrPreview: String,
    val durationMillis: Long,
    val status: TermuxCommandStatus,
    val truncated: Boolean
)

enum class TermuxCommandStatus {
    NotConfigured,
    PermissionRequired,
    Rejected,
    Completed,
    TimedOut,
    Failed
}

class TermuxBridge {
    fun isEnabled(): Boolean = false
}
`,
    ["app/src/main/java/" + pkgPath + "/background/AgentWorker.kt"]: `package ${pkg}.background

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class AgentWorker(
    appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        return Result.success()
    }
}
`,
    "README_ANDROID.md": `# ${options.name} Android App

This is the initial pure Kotlin Android Studio scaffold for Oxygen Ai.

## Open In Android Studio

1. Start Android Studio.
2. Choose "Open".
3. Select this folder:

\`\`\`text
${path.resolve(options.output)}
\`\`\`

The project uses the Android SDK path recorded in \`local.properties\` when \`--sdk-dir\` is provided.

## Current Scope

- Native Jetpack Compose chat shell.
- Kotlin package boundaries for chat, agent runtime, LiteLLM, tools, memory, research, Termux, and background work.
- Gradle Android app module.
- LiteLLM and tool execution are intentionally scaffolded, not wired to a real API key yet.

## Next Steps

1. Open/sync in Android Studio.
2. Add secure configuration for the LiteLLM base URL and API key.
3. Implement streaming in \`litellm/LiteLlmClient.kt\`.
4. Connect \`agent/AgentRuntime.kt\` to the chat UI.
5. Add Room entities and DAOs for conversation memory.
6. Keep Termux disabled until the allowlist, permission flow, and user approval UI exist.
`
  };

  if (sdkDir) {
    files["local.properties"] = `sdk.dir=${sdkDir}
`;
  }

  return files;
}

function adaptiveIconVector() {
  return `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp"
    android:height="48dp"
    android:viewportWidth="48"
    android:viewportHeight="48">
    <path
        android:fillColor="#0B1220"
        android:pathData="M24,4a20,20 0,1 0,0.1 0z" />
    <path
        android:fillColor="#38BDF8"
        android:pathData="M24,10a14,14 0,1 0,0.1 0z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M24,17a7,7 0,1 0,0.1 0z" />
</vector>
`;
}

function appendGitignore(root) {
  const gitignorePath = path.join(root, ".gitignore");
  const additions = [
    "local.properties",
    ".gradle/",
    "captures/",
    "app/build/"
  ];
  const existing = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf8") : "";
  const missing = additions.filter((item) => !existing.split(/\r?\n/).includes(item));

  if (!missing.length) {
    return false;
  }

  const next = existing.trimEnd() + "\n\n# Android local files\n" + missing.join("\n") + "\n";
  fs.writeFileSync(gitignorePath, next, "utf8");
  return true;
}

function writeAndroidProject(options) {
  const root = path.resolve(process.cwd(), options.output);
  const files = androidFiles(options);
  const result = {
    root,
    written: [],
    skipped: [],
    updated: []
  };

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

  if (appendGitignore(root)) {
    result.updated.push(".gitignore");
  }

  return result;
}

function printResult(result) {
  console.log(`Android scaffold wrote ${result.written.length} files to ${result.root}:`);
  for (const file of result.written) {
    console.log(`  + ${file}`);
  }

  if (result.updated.length) {
    console.log("Updated:");
    for (const file of result.updated) {
      console.log(`  * ${file}`);
    }
  }

  if (result.skipped.length) {
    console.log(`Skipped ${result.skipped.length} existing files. Use --force to overwrite:`);
    for (const file of result.skipped) {
      console.log(`  - ${file}`);
    }
  }
}

async function runAndroidScaffoldCli(argv) {
  const options = parseAndroidArgs(argv);

  if (options.help) {
    console.log(usage());
    return;
  }

  const result = writeAndroidProject(options);
  printResult(result);
}

module.exports = {
  parseAndroidArgs,
  writeAndroidProject,
  runAndroidScaffoldCli
};
