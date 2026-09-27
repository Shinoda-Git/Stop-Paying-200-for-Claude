# The cost model

The math behind the video, with the assumptions written down so you can check
them against your own usage.

**The claim:** a `$200` single plan is not the cheapest way to buy coding
capacity. A frontier plan plus a cheap workhorse lane can beat it — *if* the
cache holds.

---

## The workhorse prices

The cheap lane we used in the video:

| | Per 1M tokens |
|---|---|
| Input | **$0.15** |
| Output | **$0.50** |

---

## The worked example

A heavy month of agentic coding:

```
input   300M tokens × $0.15/1M  =  $45
output   30M tokens × $0.50/1M  =  $15
                                  ─────
workhorse spend                    $60

+ frontier plan (hard calls)      $100
                                  ─────
monthly total                     $160
```

Versus a single `$200` plan:

```
single plan                       $200
                                  ─────
saved                              $40/mo
```

…and the `$200` rate limits are bypassed entirely, because the bulk of the work
never touches the frontier meter.

---

## Break-even: when does the cheap lane stop winning?

The workhorse total scales with volume. Holding the frontier plan at `$100`:

| Input / month | Output / month | Workhorse | + frontier | vs `$200` |
|---|---|---|---|---|
| 100M | 10M | $20 | **$120** | −$80 |
| 200M | 20M | $40 | **$140** | −$60 |
| 300M | 30M | $60 | **$160** | −$40 |
| 400M | 40M | $80 | **$180** | −$20 |
| 500M | 50M | $100 | **$200** | **$0 — break-even** |
| 600M | 60M | $120 | **$220** | +$20 |

So for these prices, the workhorse lane beats the single `$200` plan up to
roughly **500M input + 50M output per month**. Past that you're paying more for
the same capacity — at which point the answer isn't "more workhorse," it's a
cheaper workhorse.

Run it with your own numbers:

```bash
node ../tools/budget-split.mjs --in 300 --out 30
node ../tools/budget-split.mjs --in 500 --out 50   # finds the crossover
```

---

## The cache is the math

**This entire model is conditional on the cache holding.**

Agentic coding is mostly rereading context, so the input side dominates. If the
cache is cold on most turns, you pay full input price on context that was
supposed to be cheap — and the cheap lane becomes your most expensive lane.

The video's cautionary number: **one developer spent $50 on open routers in
three days.** That's a loose-config problem, not a pricing problem.

What breaks the cache:

- Resuming old sessions after the cache expires — the whole conversation is
  resent at full price. ([`../harness/handoff.md`](../harness/handoff.md))
- Re-routing mid-task between lanes.
- Routing rules so long they themselves become context churn.
- A catch-all route that sends everything through one hot path.

What protects it:

- Strict, short routing rules ([`rules.md`](rules.md)).
- Handoff files instead of session resumes.
- Trimming startup context ([`../harness/trim-context.md`](../harness/trim-context.md)).

---

## The other half of the split: two independent meters

Splitting `$200` into `$100 + $100` across two vendors isn't only about price —
it's about **rate limits**:

- You get **two independent meters** that empty on different schedules.
- You get **spontaneous resets** from one vendor.
- You get a **reset on the other** whenever a favorable competitor drops.

No dataset proves two meters buy more raw capacity than one `$200` plan — but
they demonstrably buy more *availability*, because you're no longer bound to a
single vendor's reset cycle.

The cost of that availability is honest and worth stating: you maintain two
configs, and cross-reviewing roughly **doubles the cost of a task** unless you
declare cross-model trust ([`../adapters/claude-code.md`](../adapters/claude-code.md)).

---

## Assumptions to re-check monthly

- Workhorse input/output prices (vendors move these).
- Your actual input:output ratio — if output-heavy work dominates, the cheap
  lane is less cheap.
- Cache hit rate.
- Frontier plan price and whether it's still purchasable.

Vendors change the rules under your feet. Re-run the numbers monthly rather
than once.
