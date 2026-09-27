# Quickstart — 15 minutes to a lean setup

Do these in order. Steps 1–4 are configuration; step 5 is measurement, so do it
last and you'll see the delta.

If you only do one thing, do **step 3** (trim startup). It's the biggest hidden
cost and usually the fastest win.

---

## Step 0 — measure first (2 min)

Before you change anything, capture your baseline. In your project root:

```bash
node /path/to/blueprint/tools/token-audit.mjs
```

Note the startup-token estimate. You'll compare against it at the end.

---

## Step 1 — drop in your portable rules (3 min)

Copy the template to your repo root as `agents.md`:

```bash
cp /path/to/blueprint/harness/agents.md ./agents.md
```

Open it and fill in the `<!-- EDIT -->` sections: your stack, your test command,
your conventions. This is the file every agent reads, so keep it short and
specific. A bloated `agents.md` is itself a startup cost.

> Why `agents.md` and not a tool-specific file? Because you'll change tools
> more often than you'll change projects. See
> [`adapters/`](adapters/) for how each tool picks it up.

---

## Step 2 — wire the router (4 min)

1. Open [`routing/router.toml`](routing/router.toml) and set your
   `frontier` and `workhorse` model names.
2. Read [`routing/rules.md`](routing/rules.md) — especially the
   **verifiability test**. The config is easy; keeping the lanes strict is the
   part that saves money.
3. Add the **trust line** from
   [`adapters/claude-code.md`](adapters/claude-code.md) so your frontier
   model stops re-reviewing every cheap-model diff.

---

## Step 3 — trim what loads before you type (4 min)

Follow [`harness/trim-context.md`](harness/trim-context.md).

The short version: **turn off built-in tools you never use**. One developer cut
startup from ~25,000 to ~8,000 tokens this way — a massive reduction in daily
burn, before typing a single word.

---

## Step 4 — pin your sub-agents (2 min)

Follow [`harness/pin-subagents.md`](harness/pin-subagents.md). By default
agents will happily spin up seven or more frontier sub-agents for mundane work.
Pin them to the cheap, fast lane.

---

## Step 5 — re-measure and confirm (1 min)

```bash
node /path/to/blueprint/tools/token-audit.mjs
```

Compare with step 0. Then check the budget itself:

```bash
node /path/to/blueprint/tools/budget-split.mjs --in 300 --out 30
```

Substitute your own monthly volumes. If the workhorse lane isn't winning for
your usage, now you know before you spend a month finding out.

---

## After that

- Run [`CHECKLIST.md`](CHECKLIST.md) whenever you start a new project.
- When you end a long session, write a handoff instead of resuming —
  [`harness/handoff.md`](harness/handoff.md).
- Re-audit once a month. Vendors change their rules under your feet; your
  numbers should move with them, not after them.
