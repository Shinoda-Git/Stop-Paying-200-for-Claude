# The AI Coding Budget Blueprint

The free blueprint from the video. Everything we talked about, as files you can
copy into your own setup today.

The single `$200` plan era is over — one vendor is shrinking your limits, the
other isn't letting new people buy in. This kit is how you keep your budget,
split the load, and stop your agent from eating its own context.

It is deliberately **vendor-neutral**. The rules live in one place; thin
adapters map them onto whatever tools you actually pay for.

---

## The four pillars

| Pillar | What it is | Where it lives |
|---|---|---|
| **Split the budget** | Two independent meters beat one ceiling | [`routing/cost-model.md`](routing/cost-model.md) |
| **Route by verifiability** | If a test can grade it, the cheap lane gets it | [`routing/rules.md`](routing/rules.md) |
| **Harness survival** | Pin subs, kill stale sessions, trim startup | [`harness/`](harness/) |
| **Keep it portable** | One `agents.md` every agent reads | [`harness/agents.md`](harness/agents.md) |

---

## What's in here

```
blueprint/
  README.md              ← you are here
  QUICKSTART.md          the 15-minute path
  CHECKLIST.md           pre-flight check for a lean setup
  routing/
    router.toml          the routing config, expanded + commented
    rules.md             route by verifiability, not difficulty
    cost-model.md        the actual math, with the cache caveat
  harness/
    agents.md            portable project rules — copy to your repo root
    handoff.md           template: end a session without a full replay
    trim-context.md      cut startup tool defs from ~25k to ~8k tokens
    pin-subagents.md     stop spinning up 7 frontier sub-agents
  adapters/
    claude-code.md       CLAUDE.md wiring + the trust line
    codex.md             Codex / ChatGPT adapter
    deepseek.md          cheap-lane adapter
    glm.md               cheap-lane adapter
  tools/
    budget-split.mjs     which budget wins for your usage
    token-audit.mjs      what's loading before you type
```

---

## The 15-minute quickstart

Full detail in [`QUICKSTART.md`](QUICKSTART.md). The short version:

1. **Copy [`harness/agents.md`](harness/agents.md)** to your repo root as
   `agents.md`. Every major agent reads this one file.
2. **Wire your router** from [`routing/router.toml`](routing/router.toml) and
   read [`routing/rules.md`](routing/rules.md) so the lanes stay strict.
3. **Trim startup** using [`harness/trim-context.md`](harness/trim-context.md) —
   this is the biggest hidden cost.
4. **Pin your sub-agents** to the cheap lane
   ([`harness/pin-subagents.md`](harness/pin-subagents.md)).
5. **Audit your usage** with
   `node tools/token-audit.mjs` before you change anything, so you can see the
   delta.

---

## The cost math, in one glance

The workhorse lane we used in the video: **$0.15 / 1M input**, **$0.50 / 1M
output**.

A heavy month — **300M input + 30M output** — costs the workhorse about **$60**.
Add a **$100** frontier plan for the hard judgment calls and you land at
**$160/mo**, vs **$200** for the single plan. That's **$40/mo saved** and the
`$200` rate limits are bypassed entirely.

Run the numbers against *your* usage:

```bash
node tools/budget-split.mjs --in 300 --out 30
```

> **The catch:** this only holds if the cache holds. Loose routing rules turn
> the cheap lane into your most expensive lane — one developer burned **$50 on
> open routers in three days**. See
> [`routing/cost-model.md`](routing/cost-model.md#the-cache-is-the-math).

---

## Using the tools

Both tools are plain Node ESM with **no dependencies**. They run anywhere
Node 18+ runs.

```bash
# Which budget is cheapest for my volume?
node tools/budget-split.mjs --in 300 --out 30

# What's loading before I type? (run in your project root)
node tools/token-audit.mjs --json
```

---

## License / use

Take it, fork it, strip the parts you don't need. It's a starting point, not
gospel — the rules matter more than the exact files.
