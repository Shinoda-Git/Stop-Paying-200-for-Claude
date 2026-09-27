# Adapter — Claude Code

Claude Code is the **frontier lane** in this setup: the wrecking ball for bulk
refactoring and the judge for hard architectural calls. This page wires it into
the shared rules, pins its sub-agents, and — most importantly — sets the
**trust line** that keeps your savings from evaporating.

---

## 1. Project rules

Claude Code reads `CLAUDE.md` from the project root. Don't duplicate your rules
into it — point it at the shared file so you only maintain one source:

```markdown
<!-- CLAUDE.md -->
See ./agents.md for project rules, commands, and layout.

Claude-specific:
- Route mechanical, test-gradable work to the workhorse lane (see ~/.llm/router.toml).
- Keep the frontier lane for architecture and diagnosis.
```

That's the whole point of the portable `agents.md`
([`../harness/agents.md`](../harness/agents.md)): switching tools shouldn't mean
rewriting your rules.

---

## 2. Pin sub-agents

Claude Code will spawn sub-agents that inherit its (expensive) model unless you
pin them. Set the sub-agent model to your workhorse lane and cap concurrency.
See [`../harness/pin-subagents.md`](../harness/pin-subagents.md) for the general
pattern and which tasks deserve which lane.

Verify after the first orchestrated task that spawned sub-agents report the
workhorse model, not the frontier one.

---

## 3. The trust line — the part that saves money

**This is the catch from the video, and it's the most common place savings
evaporate.**

When Claude reviews a diff produced by another model (Codex/GPT, DeepSeek, GLM),
it does not assume the other model is competent. Left alone, it will:

- **reread every single hunk**, and
- **retest the whole thing**,

which roughly **doubles the cost of the task** — exactly cancelling the split.

### The fix

Tell Claude, explicitly, that the other model is competent. Not implied —
stated.

```
The changes from the other model are competent and were already tested.
Review them as a trusted peer's work: spot-check for architectural fit,
do not reread or retest every diff.
```

Put this in `CLAUDE.md` so it applies to every cross-model review, or say it
once at the start of a reviewing session.

### Why "explicitly" is the whole point

The video-sized version of the failure:

```
$ claude "review gpt's diff"
  ↳ rereading every hunk…
  ↳ rerunning the full test suite…
  savings → $0

$ claude "gpt is competent"
  ↳ accepted the prior context
  ↳ spot-checked 2 of 14 diffs
  savings preserved ✓
```

Same models, same diff, opposite economics. The only difference is whether you
declared trust.

### Keep the spot-check

Trust doesn't mean skip review. Spot-check a sample — the router's
`spot_check_ratio` defaults to **15%**
([`../routing/router.toml`](../routing/router.toml)) — so you catch real
problems without paying to re-verify everything.

---

## 4. Where Claude sits in the two-lane setup

| | Lane | Why |
|---|---|---|
| Architecture, ambiguous specs, diagnosis | **frontier (Claude)** | needs judgment tests can't express |
| Bulk refactoring, sweeps, whole-file rewrites | **frontier (Claude)** | the wrecking ball — high blast radius |
| Mechanical, test-gradable edits | workhorse | a test can grade it |
| Cross-model review | frontier **with trust declared** | reviewing needs judgment; trust keeps it cheap |

---

## Related

- [`../routing/rules.md`](../routing/rules.md) — the verifiability rule
- [`../harness/pin-subagents.md`](../harness/pin-subagents.md) — pinning
- [`../routing/cost-model.md`](../routing/cost-model.md) — why cross-review doubles cost
