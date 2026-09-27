# Routing rules — route by verifiability, not difficulty

This is the one rule that survives the skeptics:

> **Send work down by verifiability, not difficulty.**
> If a test can judge the result, the cheap workhorse gets it.
> If it requires deep architectural judgment, the frontier model gets it.

Difficulty is a feeling. Verifiability is a fact. You can't reliably guess how
hard a task is, but you *can* answer "will a test tell me if this is wrong?"

---

## The decision table

| Question | Answer | Lane |
|---|---|---|
| Can a test/lint/typecheck grade the result? | Yes | **workhorse** |
| Is it a mechanical, high-volume edit? | Yes | **workhorse** |
| Does it need judgment a test can't express? | Yes | **frontier** |
| Is the requirement ambiguous or underspecified? | Yes | **frontier** |
| Can't classify it? | — | **frontier** |

The last row is deliberate. Unclassified work is exactly where a cheap wrong
answer costs you a retry *plus* a review — more than the frontier call.

---

## Why this beats "route by difficulty"

Route by difficulty and you get two failure modes at once:

1. **You underestimate hard tasks** and send them cheap, then pay twice — once
   for the bad attempt, again for the fix.
2. **You overestimate easy tasks** and burn frontier tokens on renames.

Verifiability removes the guess. If you have a test, you have a cheap lane and
a safety net in the same signal.

---

## Examples that route well

**Workhorse lane (testable):**
- Rename a symbol across the codebase — the compiler decides.
- Add test coverage for an existing function.
- Mechanical refactors with a green suite before and after.
- Dependency bumps, formatting, generated code, boilerplate scaffolding.
- "Make this lint pass."

**Frontier lane (judgment):**
- "Design the auth flow for multi-tenant orgs."
- "Why is this test flaky in CI but not locally?"
- "Which of these three approaches should we take, and why?"
- Anything where the acceptance criteria don't exist yet.

---

## Cache discipline

This rule only saves money **if the cache holds.** Agentic coding is mostly
rereading context, so a loose router can turn the cheap lane into your most
expensive lane — one developer spent **$50 on open routers in three days.**

Guardrails that keep it strict:

- **No catch-all route to the workhorse.** Set `default = "frontier"` (see
  [`router.toml`](router.toml)) so unclassified work fails *closed*, not cheap.
- **Keep routing rules short.** Every rule you add is context the router must
  read on every turn.
- **Don't re-route mid-task.** Switching lanes mid-conversation throws away the
  cache and pays a full replay.
- **One task, one lane.** If a task genuinely needs both, split it at a clean
  boundary and write a handoff
  ([`../harness/handoff.md`](../harness/handoff.md)) rather than bouncing.
- **Watch the log.** `router.log` tells you when a "cheap" lane is quietly
  doing expensive work.

---

## Wiring it up

- The config: [`router.toml`](router.toml)
- The money: [`cost-model.md`](cost-model.md)
- The trust line that stops cross-review from doubling cost:
  [`../adapters/claude-code.md`](../adapters/claude-code.md)
