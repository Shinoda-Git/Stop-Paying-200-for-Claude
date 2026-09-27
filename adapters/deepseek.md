# Adapter — DeepSeek (workhorse lane)

DeepSeek is the **workhorse lane**: cheap, fast, and where the bulk of your
edits should go. In the video's math it's the reason a heavy month lands at
**$60** instead of eating a frontier plan.

---

## 1. Project rules

DeepSeek has no first-class project-rules file, which is exactly why the shared
[`agents.md`](../harness/agents.md) matters: point the harness at it when you
route work here.

```markdown
<!-- agents.md is the source of truth. -->
<!-- If your harness supports a system-prompt prefix for the workhorse, -->
<!-- prepend: "Project rules follow. Follow them exactly." then the file. -->
```

Keep whatever you send it **short**. Every token here is paid on every turn, and
the cheap lane stops being cheap if you load it with context it doesn't need.

---

## 2. Where DeepSeek sits

| Task | Lane |
|---|---|
| Mechanical edits, renames, formatting | **deepseek** |
| Scaffolding, boilerplate, generated code | **deepseek** |
| Test-writing for existing behavior | **deepseek** |
| Bulk refactors with a green suite | **deepseek** |
| Architecture, diagnosis, ambiguous specs | frontier |

The governing test is verifiability, not difficulty
([`../routing/rules.md`](../routing/rules.md)): **if a test can grade it, route
it here.**

---

## 3. Pricing notes

The video's numbers: **$0.15 / 1M input**, **$0.50 / 1M output**. Those move —
re-check them monthly. If the workhorse prices rise, the break-even point moves:

```bash
node ../tools/budget-split.mjs --in 300 --out 30 --workhorse-in 0.15 --workhorse-out 0.50
```

Pass your own prices to see whether the lane still wins.

---

## 4. Cache discipline — critical here

The cheap lane is where the cache matters most, because input dominates agentic
work. If the cache is cold, cheap input stops being cheap and this lane becomes
your most expensive one — the video's **$50 in three days** cautionary number.

Protect it:

- Serve this lane from a **strict** route, never a catch-all
  ([`../routing/router.toml`](../routing/router.toml)).
- Don't bounce a task between lanes mid-flight.
- Kill stale sessions; hand off instead
  ([`../harness/handoff.md`](../harness/handoff.md)).

---

## 5. Pinning

Sub-agents on this lane are already where they belong. When you pin *from* the
frontier side, point the pin at DeepSeek — see
[`../harness/pin-subagents.md`](../harness/pin-subagents.md).

---

## Related

- [`glm.md`](glm.md) — the other workhorse option
- [`../routing/cost-model.md`](../routing/cost-model.md) — the math and its caveats
- [`claude-code.md`](claude-code.md) — the frontier lane that reviews this output
