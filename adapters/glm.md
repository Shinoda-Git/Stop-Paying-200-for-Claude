# Adapter — GLM flash (workhorse lane)

GLM's flash models are the other cheap, open-weight workhorse named in the
video. They fill the same role as DeepSeek: **bulk edits that a test can grade.**

Pick one as your primary workhorse and keep the other as a fallback — having two
cheap options means a price change or outage on one lane doesn't push you back
onto the frontier meter.

---

## 1. Project rules

Like DeepSeek, GLM has no first-class project-rules file. Route the shared
[`agents.md`](../harness/agents.md) in as a system-prompt prefix, and keep it
short — this lane's whole advantage is price.

---

## 2. Where GLM sits

| Task | Lane |
|---|---|
| Mechanical edits, renames, formatting | **glm** |
| Scaffolding, boilerplate, generated code | **glm** |
| Test-writing for existing behavior | **glm** |
| Bulk refactors with a green suite | **glm** |
| Architecture, diagnosis, ambiguous specs | frontier |

Same rule as always: **verifiability, not difficulty**
([`../routing/rules.md`](../routing/rules.md)).

---

## 3. DeepSeek vs GLM — which workhorse?

They're close enough that the tiebreaker is operational, not ideological:

- **Try both for a week** on real tasks and compare cost *and* retry rate.
- **Retry rate matters as much as price.** A slightly pricier model that needs
  fewer retries is usually cheaper in total.
- **Keep a fallback.** If your primary workhorse raises prices or degrades,
  swapping to the other should be a one-line router change.

```toml
# ~/.llm/router.toml
[router]
workhorse = "glm"        # or "deepseek"

[[route]]
name      = "mechanical-edits"
when      = "testable"
model     = "workhorse"
fallback  = "deepseek"   # if your harness supports a fallback lane
```

---

## 4. Pricing and the break-even

The video's workhorse prices (**$0.15 / 1M in**, **$0.50 / 1M out**) apply to
GLM flash as a class. Re-check monthly and re-run the math with your numbers:

```bash
node ../tools/budget-split.mjs --in 300 --out 30
```

---

## 5. Cache discipline

Same warning as DeepSeek: this lane only stays cheap if the cache holds. Strict
routes, no mid-task lane bouncing, handoff instead of session resume. See
[`../routing/cost-model.md`](../routing/cost-model.md#the-cache-is-the-math).

---

## 6. Pinning

When you pin sub-agents from the frontier side, point them here. See
[`../harness/pin-subagents.md`](../harness/pin-subagents.md).

---

## Related

- [`deepseek.md`](deepseek.md) — the other workhorse option
- [`../routing/cost-model.md`](../routing/cost-model.md) — the math and its caveats
- [`claude-code.md`](claude-code.md) — the frontier lane that reviews this output
