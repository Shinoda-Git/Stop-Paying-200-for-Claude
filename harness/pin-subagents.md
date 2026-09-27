# Pin your sub-agents

**Tactic 01 from the video.**

## The problem

By default, an orchestrator agent will happily spin up **seven or more
sub-agents** for mundane work — and unless you say otherwise, they inherit the
frontier model.

Renaming a function across five files does not need your most expensive model.
Neither does finding every `TODO`, or running a test suite, or scaffolding
boilerplate. But left alone, that's exactly where the frontier tokens go.

Seven sub-agents on the frontier model, each with its own context, is one of the
fastest ways to empty a weekly quota by Tuesday.

## The fix

**Pin sub-agents to the cheap, fast model** for basic tasks. Reserve the
frontier lane for the sub-tasks that actually need judgment — usually the
orchestrator itself, not its helpers.

---

## How to pin

The mechanism varies by tool (see [`../adapters/`](../adapters/)), but the
shape is the same:

1. **Find the default model for spawned sub-agents.** Most harnesses let you set
   this separately from the main agent's model. If it's unset, it inherits the
   expensive one.
2. **Set it to your workhorse lane** (`deepseek` / `glm` / whatever your cheap
   lane is — see [`../routing/router.toml`](../routing/router.toml)).
3. **Keep the orchestrator on the frontier lane.** The planner needs judgment;
   the workers mostly need speed.
4. **Cap concurrency.** Seven parallel frontier agents is a budget decision, not
   just a performance one.

```toml
# Illustrative — see adapters/ for your actual harness.
[subagents]
model     = "workhorse"   # the pin
max_parallel = 3          # cap the spin-up
```

---

## Which sub-agents get which lane

| Sub-agent task | Lane |
|---|---|
| Search / grep / locate a symbol | workhorse |
| Run tests, read output, summarize failures | workhorse |
| Mechanical edits, renames, formatting | workhorse |
| Scaffold boilerplate / tests | workhorse |
| "Which approach should we take?" | frontier |
| Diagnose a flaky failure | frontier |
| Design a cross-cutting change | frontier |

The test is the same one that governs routing
([`../routing/rules.md`](../routing/rules.md)): **if a test can grade the
result, pin it to the workhorse.**

---

## Verify it took

After pinning, watch one orchestrated task and confirm:

- Spawned sub-agents report the **workhorse** model, not the frontier one.
- Concurrency caps at the limit you set.
- The orchestrator is still the frontier model.

If sub-agents are still inheriting the frontier model, your pin didn't apply —
check the adapter page for your tool.

---

## Related

- [`../routing/rules.md`](../routing/rules.md) — the verifiability rule
- [`trim-context.md`](trim-context.md) — the other fixed saving
- [`../routing/cost-model.md`](../routing/cost-model.md) — why this matters at scale
