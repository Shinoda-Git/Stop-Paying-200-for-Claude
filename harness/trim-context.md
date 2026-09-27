# Trim what loads before you type

**Tactic 03 from the video — the biggest hidden cost.**

## The problem

Some coding environments start with **20,000 to 25,000 tokens of tool
definitions** loaded into context. Before you type a single word.

You pay for that on every turn. It's rent on tools you may never use, and it's
invisible because it never appears in your prompt.

## The fix

Switch off built-in tools you never use, and audit what else loads on startup.

One developer took his startup prompt from **25,000 down to 8,000 tokens** this
way. That's a ~68% cut to the fixed cost of every single turn.

At the workhorse input price from [`../routing/cost-model.md`](../routing/cost-model.md)
($0.15/1M), 17,000 tokens saved × 100 turns/day × 30 days ≈ **$7.65/mo** on the
cheap lane. On a frontier model at 10–20× that price, the same cut is
**$75–150/mo** — for turning off tools you weren't using.

---

## Step 1 — measure

Run the audit in your project root:

```bash
node ../tools/token-audit.mjs
```

It estimates what loads at startup and flags the biggest contributors. Get a
baseline number before you change anything.

## Step 2 — inventory your tools

List every built-in tool your environment enables. For each, answer honestly:

- **Have I used it in the last month?**
- **Could a shell command do the same job?**
- **Does it duplicate another tool?**

Most setups carry several tools that fail all three.

## Step 3 — switch off the dead weight

Turn off the ones you don't use. Start with the obvious:

- Browser / screenshot tools if you're working on a backend.
- Database tools if you're not touching one this project.
- Cloud/deploy tools if deploys happen in CI.
- Web-search tools you never call.
- Any "kitchen sink" bundle you can't name the contents of.

## Step 4 — trim the other startup context

Tool definitions are the biggest chunk, but not the only one:

- **`agents.md`** — keep it short. It loads every turn. Move paragraphs into
  code or tests.
- **Globbed file context** — don't auto-include whole directories.
- **MCP servers** — every connected server contributes its tool schemas. Connect
  only what this project needs.
- **System prompt add-ons** — stack of "helpful" instructions adds up fast.

## Step 5 — re-measure

```bash
node ../tools/token-audit.mjs --json
```

Compare against step 1. If you didn't move the number, you trimmed the wrong
thing.

---

## Targets

| Startup load | Verdict |
|---|---|
| **< 10k tokens** | Lean. Leave it alone. |
| **10k–20k** | Trim. There's usually 30–50% available. |
| **> 20k** | Aggressively trim. You're paying rent before you code. |

---

## Why this compounds

Unlike the routing rules, this is a **fixed** saving — it applies to every turn
of every task, whether the cache is warm or cold. The routing rules only pay off
when the cache holds ([`../routing/cost-model.md`](../routing/cost-model.md#the-cache-is-the-math)).
Trimming startup pays off unconditionally.

Do this one first.
