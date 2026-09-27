# agents.md

<!--
Copy this file to the ROOT of your project, as `agents.md`.
Every major coding agent reads this one file. Keep it short and specific —
this file loads on every turn, so a bloated `agents.md` is itself a startup cost.

Fill in every section marked `<!-- EDIT -->`. Delete the HTML comments when done.
-->

## Project

**What it is:** <!-- EDIT: one sentence -->

**Stack:** <!-- EDIT: e.g. TypeScript, React 19, Node 20, Postgres -->

**Package manager:** <!-- EDIT: npm / pnpm / yarn / uv / cargo -->

## Commands

These are the commands agents should use. Do not guess alternates.

```bash
# install
<!-- EDIT -->

# dev / run
<!-- EDIT -->

# test — the source of truth for "is this correct?"
<!-- EDIT -->

# typecheck / lint
<!-- EDIT -->
```

## Rules

Short, imperative, projects-specific. Delete anything that isn't true for you.

- Run the test command before claiming a task is done.
- Never hand-edit generated files. <!-- EDIT: list them -->
- Match the surrounding code style; don't reformat untouched lines.
- Prefer editing existing files over creating new ones.
- No new dependencies without asking.

<!-- EDIT: add your own. Keep the list under ~10 items. -->

## Layout

```
<!-- EDIT: 3–8 lines. The directories an agent must not get lost in. -->
```

## Off-limits

<!-- EDIT: files/paths agents must never touch, and why. -->

- Secrets, credentials, `.env` files.
- <!-- EDIT -->

## Definition of done

A task is done when:

1. The test command passes.
2. The typecheck/lint command is clean.
3. The diff is limited to the requested change.

---

<!--
Notes for whoever maintains this file:

- This template is deliberately tool-agnostic so it survives a vendor switch.
  Tool-specific files should point *at* this file, not duplicate it. See
  ../adapters/ for how each tool picks it up.
- If a rule needs a paragraph to explain, it probably belongs in code or a test
  instead. Rules here should be cheap to read on every turn.
-->
