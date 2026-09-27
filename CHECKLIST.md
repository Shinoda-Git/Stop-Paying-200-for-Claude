# Pre-flight checklist

Run this when you set up a new project, or when your usage suddenly spikes.
Every item maps to a real failure mode — the same ones the video called out.

---

## Budget

- [ ] I'm **not** relying on a single `$200` plan for everything.
- [ ] If splitting: I have two independent meters and know which empties when.
- [ ] If using a workhorse lane: I've run
      `node tools/budget-split.mjs` with **my** volumes, not the video's.
- [ ] I know my cache assumption and what breaks it.

## Routing

- [ ] Routes are split by **verifiability**, not difficulty.
- [ ] Anything a test can grade goes to the cheap lane.
- [ ] Architectural judgment calls go to the frontier lane.
- [ ] Routing rules are **strict** — no catch-all "send everything cheap."
- [ ] The **trust line** is set, so the frontier model doesn't re-review every
      cheap diff (this is where savings evaporate).

## Harness

- [ ] Sub-agents are **pinned** to the cheap/fast lane.
- [ ] I'm writing **handoff files** instead of resuming expired sessions.
- [ ] Built-in tools I never use are **switched off**.
- [ ] I know my startup token load (and it's not 20–25k).
- [ ] `agents.md` exists, is current, and is short.

## Portability

- [ ] Project rules live in **one** `agents.md`, not scattered per-tool files.
- [ ] Tool-specific files (if any) just point at `agents.md`.
- [ ] I can switch vendors without rewriting my rules.

## Measurement

- [ ] I've run the usage audit **this month**.
- [ ] I can name where my tokens actually go.
- [ ] I have a note of last month's spend to compare against.

---

## Red flags

If any of these are true, stop and fix before optimizing anything else:

- **A catch-all route to the cheap lane.** Loose rules make the cheap lane your
  most expensive lane. One dev burned $50 in three days this way.
- **Resuming sessions from days ago.** Expired cache means a full-price replay
  of the whole conversation.
- **20k+ startup tokens.** You're paying rent before you type.
- **No trust declaration.** Your frontier model rereads and retests every diff.
