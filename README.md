# Debate Academy

Gamified debate practice for pupils: learn what a debate is, define a motion, build a substantive
brick by brick (**Point → Significance → Cause → Effect → Example**), then find the cracked brick in an
opponent's argument and reply with **SAY → BUT → BECAUSE → SO**.

Cloudflare Worker + D1 + static assets. No framework, no build step.

## Deploy (about 5 minutes)

```bash
npm install                                   # installs wrangler (v4+ needed for run_worker_first)
npx wrangler login
npx wrangler d1 create debate-academy         # copy the database_id it prints
#   -> paste it into wrangler.toml (database_id = "...")
npx wrangler deploy
```

Tables are created automatically on the first request. `schema.sql` is included if you prefer to run it
yourself (`npx wrangler d1 execute debate-academy --remote --file=schema.sql`); regenerate it with `npm run schema`.

### Teacher login (do this straight away)

Until you set secrets, the teacher login is **Admin / Password123** and the dashboard shows a red warning.

```bash
npx wrangler secret put admin_user
npx wrangler secret put admin_password
```

Once set, the defaults stop working immediately. If you set only one secret, the other keeps its default
(and the warning names which).

## Rebuttals: how they are taught

Three sentence starters cover the five rebuttal types from your notes:

| Starter | Covers | Sub-types practised |
|---|---|---|
| **Not true** | Direct refutation, attacking the logic | Denial (no link), counter-evidence, correlation is not causation, slippery slope, internal inconsistency |
| **Even if** | Mitigation, weighing | Low probability, low severity, timeframe, magnitude, reversibility |
| **Your side worsens the issue** | The turn | Link turn, impact turn |

The starter is the **BUT** in **SAY → BUT → BECAUSE → SO**. Pupil activities:
- **Rebuttal Toolkit**: lesson with a kid-friendly example for every sub-type and your summary table (30 XP, once).
- **Name That Rebuttal**: shown a reply without its starter, pupils pick the starter, then the exact sub-type (up to 60 XP, 3 rounds a day).
- **Rebuttal Lab**: read an argument, choose a starter, write a rebuttal, compare with a model, try the other two starters (15 XP per case + starter). Optionally send it to the teacher; it appears under Submissions as a Rebuttal.
- **Rebuttal Arena**: the BUT box now must begin with one of the three starters.

Rebuttal content lives in `public/content.js` (`RB_FAMILIES`, `RB_ITEMS`, `LAB_CASES`).

## Using it

**Teacher** (log in on the "I'm a teacher" tab)
1. *Classes*: create a class; each gets a 6-character code (no 0/O/1/I/L).
2. *Pupils*: paste names, one per line. Usernames are generated (`amytan47`). Add a comma to choose one: `Cheryl Ong, cheryl.o`.
3. *Cards*: print cards with name, username, class code and the app URL (2 per row, cut on the dotted lines).
4. *Submissions*: filter by class/type/status, read the work, leave feedback and 0-4 stars (15 XP per star; re-grading adjusts rather than double-pays).
5. *Motions*: add your own motions (optionally limited to one class, with a hint pupils see).

**Pupil** logs in with username + class code (no password).

## Editing the teaching content

Everything pupils read is in `public/content.js`: the brick definitions, slides, sample arguments, drill pool
and the six Rebuttal Arena cases. Brick order is one array (`BRICK_ORDER`) at the top.

## Check before class

The sample and case-file examples cite real events. Please verify before presenting:
- **Basel pigeons** (Prop sample): per The Local (2024), Basel culled for decades with no lasting fall, then reportedly halved numbers with egg-swapping lofts. A 2024 Bluewin report says Basel later closed lofts and barely enforces its feeding ban, so a sharp pupil could rebut this example.
- **Berlin wild boar** (Opp sample): per NPR (2012): thousands of boar, hunters called in to cull hundreds a year, a boar injured four people in 2012.
- **Quebec fast food ads, the 2008 *Science* zoo-elephant study, Finland and homework, tutoring research**: written from general knowledge, not re-checked.

## Security notes

- Sessions are random 256-bit tokens, stored hashed in D1, sent as a Bearer header (no cookies, so no CSRF). Pupils: 14 days. Teacher: 12 hours.
- Teacher login is throttled (10 failures / 10 min / IP). Pupil login is throttled per IP + class code (60 / 10 min, generous because a class shares one school IP).
- Pupil XP claims are validated server-side: clamped per activity, once-only keys, daily caps. A determined pupil can still inflate drill XP a little; teacher-graded XP cannot be forged.
- Pupils have no password. Anyone with a pupil's username and class code *is* that pupil. Treat the printed cards accordingly.
- All user text is rendered with `textContent`; a CSP and other security headers are set in `public/_headers`.
- Pupil data is names + written work. Check this fits your school's data-protection policy before use.
