# Adapter — Codex / ChatGPT

Codex is the **chisel** in this setup: precision architecture and small, exact
diffs. It pairs with a bulk-refactoring agent (Claude, the wrecking ball) so the
two model families complement rather than compete.

> Config file names for Codex change between releases. The *shape* below is what
> matters — check your tool's docs for the current filename.

---

## 1. Project rules

Codex reads an `AGENTS.md` from the project root (some versions also read
`codex.md`). Point it at the shared file rather than maintaining a second copy:

```markdown
<!-- AGENTS.md -->
See ./agents.md for project rules, commands, and layout.

Codex-specific:
- Prefer small, exact diffs over broad rewrites.
- When reviewing another model's work, treat it as a competent peer
  (see adapters/claude-code.md for the exact line).
```

Note the casing: `AGENTS.md` for Codex vs `agents.md` for the shared file. On
case-insensitive filesystems they collide — if you hit that, symlink one to the
other rather than maintaining two divergent files.

---

## 2. Where Codex sits

| Task | Lane | Why |
|---|---|---|
| Precision architecture | frontier | judgment, small blast radius |
| Exact, surgical diffs | frontier | the chisel's strength |
| Cross-review of bulk changes | frontier | reviewing needs judgment |
| Mechanical / test-gradable edits | workhorse | a test can grade it |

---

## 3. The two-meter advantage

If you run Codex on a ChatGPT plan alongside Claude on a Claude plan, you have
**two independent meters**:

- They empty on different schedules.
- Each vendor's resets land independently.
- A competitor release often triggers a reset on one side.

That availability is the other half of the split — no dataset proves two meters
buy more raw capacity, but they demonstrably buy more *uptime*. See
[`../routing/cost-model.md`](../routing/cost-model.md#the-other-half-of-the-split-two-independent-meters).

---

## 4. Pinning

Codex-spawned sub-agents should be pinned to the workhorse lane the same way as
any other harness — see [`../harness/pin-subagents.md`](../harness/pin-subagents.md).

---

## Related

- [`claude-code.md`](claude-code.md) — the complementary lane, and the trust line
- [`../routing/rules.md`](../routing/rules.md) — the verifiability rule
- [`../harness/agents.md`](../harness/agents.md) — the shared rules
