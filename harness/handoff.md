# Handoff files — stop resuming old sessions

**Tactic 02 from the video.**

## The problem

Resuming an old agent session feels free. It isn't.

Once the cache expires, the entire conversation gets sent again — at full
price, with no discount. A long session that you resume after a day away can
resend every turn you ever had, just to get back to where you were. You pay for
the whole history to ask one more question.

Cost scales with how long you've been away, which is exactly backwards from how
it feels.

## The fix

Don't resume. **Write a handoff file, then start fresh.**

A handoff file compresses everything the next session actually needs into a few
hundred tokens, so a fresh session rebuilds its cache once — over a small,
relevant context — instead of replaying a large, mostly-stale one.

---

## Template

Save as `handoff.md` (git-ignored, or in a scratch dir — it's operational, not
source). Overwrite it each time; you only ever need the latest one.

```markdown
# Handoff — <task name>

## Goal
<one or two sentences: what we're trying to achieve>

## State
<where things stand right now. What works, what doesn't.>

## Done
- <completed item>
- <completed item>

## In progress
- <the thing that was mid-flight, and exactly how far it got>

## Next
- <the single next action>

## Gotchas
- <anything the next session would otherwise rediscover the hard way>
  e.g. "the flaky test only fails when run after the auth suite"

## Files
- <path> — <why it matters>
```

---

## Example

```markdown
# Handoff — fix auth refresh loop

## Goal
Users get logged out after ~15 min. Refresh token flow is looping
between the client interceptor and the /refresh endpoint.

## State
Reproduced locally. The interceptor retries on 401 without checking
whether the refresh already failed, so it loops until the token expires.

## Done
- Added a failing test: `auth.interceptor.test.ts > "does not retry a failed refresh"`

## In progress
- Fix is half-applied in `src/auth/interceptor.ts` (~line 42): the retry guard
  is added but the error path still swallows the original error.

## Next
- Make the guard surface the original refresh error instead of retrying.

## Gotchas
- The test passes if you run it alone; it only fails when run after the auth
  suite, because of shared mock state in `test/setup.ts`.

## Files
- src/auth/interceptor.ts — the loop lives here
- src/auth/refresh.ts — the endpoint, unchanged
- test/setup.ts — shared mutable mock state
```

---

## How it fits the rest

- Fresh sessions rebuild the cache **once**, small — see
  [`../routing/cost-model.md`](../routing/cost-model.md#the-cache-is-the-math).
- The rules the fresh session should follow live in
  [`../harness/agents.md`](agents.md), not in the handoff.
- A fresh session is also a clean lane boundary — don't re-route mid-task
  ([`../routing/rules.md`](../routing/rules.md#cache-discipline)).
