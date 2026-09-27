#!/usr/bin/env node
/**
 * token-audit.mjs
 *
 * Estimate what loads into context BEFORE you type a word — the biggest hidden
 * cost in the video. Flags the usual suspects: rule files, MCP servers, and
 * tool-definition config.
 *
 * This is a HEURISTIC, not a tokenizer. It counts characters in the files your
 * harness is likely to read and applies a chars-per-token estimate. It will not
 * match your vendor's token count exactly — it's for finding where the weight
 * is and whether a change moved the number.
 *
 * No dependencies. Node 18+.
 *
 * Usage:
 *   node token-audit.mjs                 # audit the current directory
 *   node token-audit.mjs --path ./myapp
 *   node token-audit.mjs --json
 *   node token-audit.mjs --help
 */

import { parseArgs } from "node:util";
import { readFile, readdir, stat, realpath } from "node:fs/promises";
import { join, relative } from "node:path";

/* ─────────────────────────── assumptions ─────────────────────────── */

/** Rough chars-per-token for code/markdown (English+code mix). */
const CHARS_PER_TOKEN = 3.8;

/** Estimated schema/serialization overhead per connected MCP server, in tokens. */
const MCP_SERVER_OVERHEAD = 1200;

/* ─────────────────────────── known contributors ─────────────────────────── */

/** Single files a harness commonly auto-loads from the project root. */
const RULE_FILES = [
  "agents.md",
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "codex.md",
  ".cursorrules",
  ".windsurfrules",
  ".github/copilot-instructions.md",
];

/** MCP / tool config files; the array inside is what matters. */
const MCP_FILES = [".mcp.json", ".cursor/mcp.json", "claude_desktop_config.json"];

/** Directories of per-rule files that all load. */
const RULE_DIRS = [".cursor/rules"];

/* ─────────────────────────── helpers ─────────────────────────── */

const estTokens = (chars) => Math.round(chars / CHARS_PER_TOKEN);

async function readIfExists(path) {
  try {
    const s = await stat(path);
    if (!s.isFile()) return null;
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

async function listRuleDir(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => join(dir, e.name));
  } catch {
    return [];
  }
}

/** Count MCP servers declared in a config file (best-effort). */
function countMcpServers(text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return 0;
  }
  const containers = [json.mcpServers, json.servers, json.mcp?.servers];
  for (const c of containers) {
    if (c && typeof c === "object") return Object.keys(c).length;
  }
  return 0;
}

/* ─────────────────────────── audit ─────────────────────────── */

async function audit(root, toolFloor) {
  // Fail loudly on a bad root rather than reporting a misleading lean zero.
  try {
    const s = await stat(root);
    if (!s.isDirectory()) {
      throw new Error(`not a directory: ${root}`);
    }
  } catch (err) {
    if (err.code === "ENOENT") throw new Error(`path not found: ${root}`);
    throw err;
  }

  const findings = [];
  const seen = new Set(); // real paths, to avoid double-counting on case-insensitive FS
  let totalChars = 0;
  let mcpServers = 0;

  /** Read a file once per real path; returns text or null. */
  const readOnce = async (path) => {
    let real;
    try {
      real = await realpath(path);
    } catch {
      return null;
    }
    if (seen.has(real)) return null;
    const text = await readIfExists(path);
    if (text === null) return null;
    seen.add(real);
    return text;
  };

  // 1. Root rule files.
  for (const name of RULE_FILES) {
    const text = await readOnce(join(root, name));
    if (text === null) continue;
    totalChars += text.length;
    findings.push({
      kind: "rule-file",
      path: name,
      tokens: estTokens(text.length),
      chars: text.length,
    });
  }

  // 2. Rule directories (every file loads).
  for (const dir of RULE_DIRS) {
    for (const file of await listRuleDir(join(root, dir))) {
      const text = await readOnce(file);
      if (text === null) continue;
      totalChars += text.length;
      findings.push({
        kind: "rule-file",
        path: relative(root, file),
        tokens: estTokens(text.length),
        chars: text.length,
      });
    }
  }

  // 3. MCP configs — the servers themselves cost schema overhead.
  for (const name of MCP_FILES) {
    const text = await readIfExists(join(root, name));
    if (text === null) continue;
    const servers = countMcpServers(text);
    mcpServers += servers;
    findings.push({
      kind: "mcp-config",
      path: name,
      tokens: servers * MCP_SERVER_OVERHEAD,
      servers,
      note: `${servers} server(s) × ~${MCP_SERVER_OVERHEAD} tok overhead`,
    });
  }

  const fileTokens = estTokens(totalChars);
  const mcpTokens = mcpServers * MCP_SERVER_OVERHEAD;
  const total = fileTokens + mcpTokens + toolFloor;

  return {
    root,
    findings: findings.sort((a, b) => b.tokens - a.tokens),
    fileTokens,
    mcpTokens,
    mcpServers,
    toolOverhead: toolFloor,
    total,
  };
}

function verdict(total) {
  if (total < 10000) return { label: "LEAN", tone: "ok" };
  if (total < 20000) return { label: "TRIM", tone: "warn" };
  return { label: "AGGRESSIVE TRIM", tone: "bad" };
}

/* ─────────────────────────── main ─────────────────────────── */

const HELP = `
token-audit.mjs — what loads before you type?

Heuristic startup-context estimator. Finds rule files and MCP servers in a
project root, estimates their token cost, and flags the heaviest contributors.

Usage:
  node token-audit.mjs [options]

Options:
  --path <dir>       project root to audit      (default: cwd)
  --tool-floor <n>   add a fixed estimate for harness tool definitions
                     you can't measure from disk (e.g. 25000)
  --json             machine-readable output
  -h, --help         show this help

Notes:
  - Estimates use ~${CHARS_PER_TOKEN} chars/token. Treat the number as a relative
    signal, not an exact count.
  - By default this measures only what's on disk (rule files + MCP servers).
    Tool definitions your harness loads itself are invisible here — that's what
    --tool-floor is for. Log in and check your harness, or model the video's
    worst case with --tool-floor 25000.
  - Run before and after trimming (harness/trim-context.md) to see the delta.
`;

function main() {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        path: { type: "string" },
        "tool-floor": { type: "string" },
        json: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
      allowPositionals: false,
    });
  } catch (err) {
    console.error(`error: ${err.message}\n${HELP}`);
    process.exit(1);
  }

  const { values } = parsed;
  if (values.help) {
    console.log(HELP);
    return;
  }

  const root = values.path ?? process.cwd();

  let toolFloor = 0;
  if (values["tool-floor"] !== undefined) {
    const n = Number(values["tool-floor"]);
    if (!Number.isFinite(n) || n < 0) {
      console.error(
        `error: --tool-floor must be a non-negative number, got "${values["tool-floor"]}"`,
      );
      process.exit(1);
    }
    toolFloor = n;
  }

  audit(root, toolFloor)
    .then((result) => {
      if (values.json) {
        const v = verdict(result.total);
        console.log(
          JSON.stringify(
            {
              root: result.root,
              estimatedStartupTokens: result.total,
              verdict: v.label,
              breakdown: {
                ruleFiles: result.fileTokens,
                mcpServers: result.mcpTokens,
                toolFloor: result.toolOverhead,
              },
              findings: result.findings,
            },
            null,
            2,
          ),
        );
        return;
      }

      const v = verdict(result.total);
      console.log("");
      console.log("  Startup context audit");
      console.log("  " + "─".repeat(56));
      console.log(`  root: ${result.root}`);
      console.log("");

      if (result.findings.length === 0) {
        console.log("  (no rule files or MCP configs found)");
      } else {
        console.log("  heaviest contributors");
        for (const f of result.findings.slice(0, 12)) {
          const tag = f.kind === "mcp-config" ? "mcp " : "file";
          console.log(
            `    ${tag}  ${String(f.tokens).padStart(7)} tok   ${f.path}` +
              (f.note ? `   (${f.note})` : ""),
          );
        }
        console.log("");
      }

      console.log("  " + "─".repeat(56));
      console.log(`  rule files                ${String(result.fileTokens).padStart(7)} tok`);
      console.log(
        `  mcp servers (${result.mcpServers})          ${String(result.mcpTokens).padStart(7)} tok`,
      );
      if (toolFloor > 0) {
        console.log(
          `  harness tool floor        ${String(result.toolOverhead).padStart(7)} tok  (estimated)`,
        );
      } else {
        console.log(`  harness tool floor        ${"      —".padStart(7)}     (not measured)`);
      }
      console.log("  " + "─".repeat(56));
      console.log(`  ESTIMATED TOTAL           ${String(result.total).padStart(7)} tok   [${v.label}]`);
      console.log("");

      if (toolFloor === 0) {
        console.log("  Heads up: your harness's own tool definitions aren't counted");
        console.log("  here. If you suspect they're heavy, model it:");
        console.log("    node tools/token-audit.mjs --tool-floor 25000");
        console.log("");
      }

      if (v.tone !== "ok") {
        console.log("  Next: trim built-in tools you never use, and shorten your");
        console.log("        rule files. See harness/trim-context.md.");
        console.log("        Target: < 10,000 startup tokens (all-in).");
        console.log("");
      }
      console.log("  Heuristic (~" + CHARS_PER_TOKEN + " chars/token). Relative signal, not an exact count.");
      console.log("");
    })
    .catch((err) => {
      console.error(`error: ${err.message}`);
      process.exit(1);
    });
}

main();
