#!/usr/bin/env node
/**
 * budget-split.mjs
 *
 * Which budget actually wins for your usage?
 *
 * Compares three strategies at a given monthly token volume:
 *   1. single   — one $200 plan
 *   2. split    — $100 + $100 across two vendors
 *   3. workhorse— $100 frontier plan + a cheap workhorse lane
 *
 * The workhorse lane is priced per 1M tokens (input/output), so its cost scales
 * with your volume; the other two are flat. That's the whole point: above some
 * volume the cheap lane stops winning. This tool finds where.
 *
 * No dependencies. Node 18+.
 *
 * Usage:
 *   node budget-split.mjs --in 300 --out 30
 *   node budget-split.mjs --in 500 --out 50 --workhorse-in 0.15 --workhorse-out 0.50
 *   node budget-split.mjs --help
 */

import { parseArgs } from "node:util";

/* ─────────────────────────── defaults ─────────────────────────── */

const DEFAULTS = {
  // Monthly token volume, in MILLIONS (matches how people quote usage).
  inM: 300,
  outM: 30,

  // Workhorse lane prices, USD per 1M tokens. The video's numbers.
  workhorseIn: 0.15,
  workhorseOut: 0.5,

  // Flat plan prices, USD per month.
  singlePlan: 200,
  splitA: 100,
  splitB: 100,
  frontierPlan: 100,
};

/* ─────────────────────────── pricing ─────────────────────────── */

const workhorseCost = (inM, outM, priceIn, priceOut) =>
  inM * priceIn + outM * priceOut;

/**
 * Crossover volume: at what monthly input (holding the input:output ratio)
 * does the workhorse lane stop beating the single plan?
 */
const crossoverInputM = ({ outM, workhorseIn, workhorseOut, singlePlan, frontierPlan, inM }) => {
  const ratio = inM > 0 ? outM / inM : 0;
  const budget = singlePlan - frontierPlan; // left for the workhorse lane
  // inM * pIn + (inM * ratio) * pOut = budget
  const perInput = workhorseIn + ratio * workhorseOut;
  if (perInput <= 0 || budget <= 0) return null;
  return budget / perInput;
};

/* ─────────────────────────── formatting ─────────────────────────── */

const money = (n) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
const label = (n) => `${n}M`;

function bar(cost, max, width = 28) {
  const filled = max > 0 ? Math.round((cost / max) * width) : 0;
  return "█".repeat(Math.max(0, filled)) + "·".repeat(Math.max(0, width - filled));
}

/* ─────────────────────────── main ─────────────────────────── */

const HELP = `
budget-split.mjs — which AI coding budget wins for your usage?

Usage:
  node budget-split.mjs [options]

Options:
  --in <M>              monthly input tokens, in millions      (default ${DEFAULTS.inM})
  --out <M>             monthly output tokens, in millions     (default ${DEFAULTS.outM})
  --workhorse-in <USD>  workhorse price / 1M input tokens      (default ${DEFAULTS.workhorseIn})
  --workhorse-out <USD> workhorse price / 1M output tokens     (default ${DEFAULTS.workhorseOut})
  --single <USD>        price of the single plan               (default ${DEFAULTS.singlePlan})
  --frontier <USD>      price of the frontier plan             (default ${DEFAULTS.frontierPlan})
  --split-a <USD>       first $ of the split                    (default ${DEFAULTS.splitA})
  --split-b <USD>       second $ of the split                   (default ${DEFAULTS.splitB})
  --json                machine-readable output
  -h, --help            show this help

Examples:
  node budget-split.mjs --in 300 --out 30
  node budget-split.mjs --in 600 --out 60            # past break-even
  node budget-split.mjs --in 200 --out 10 --json
`;

function main() {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        in: { type: "string" },
        out: { type: "string" },
        "workhorse-in": { type: "string" },
        "workhorse-out": { type: "string" },
        single: { type: "string" },
        frontier: { type: "string" },
        "split-a": { type: "string" },
        "split-b": { type: "string" },
        json: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
      allowPositionals: false,
    });
  } catch (err) {
    console.error(`error: ${err.message}\n${HELP}`);
    process.exit(1);
  }

  const { values } = parsed;
  if (values.help) {
    console.log(HELP);
    return;
  }

  const num = (raw, fallback, name) => {
    if (raw === undefined) return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      console.error(`error: --${name} must be a non-negative number, got "${raw}"`);
      process.exit(1);
    }
    return n;
  };

  const cfg = {
    inM: num(values.in, DEFAULTS.inM, "in"),
    outM: num(values.out, DEFAULTS.outM, "out"),
    workhorseIn: num(values["workhorse-in"], DEFAULTS.workhorseIn, "workhorse-in"),
    workhorseOut: num(values["workhorse-out"], DEFAULTS.workhorseOut, "workhorse-out"),
    singlePlan: num(values.single, DEFAULTS.singlePlan, "single"),
    frontierPlan: num(values.frontier, DEFAULTS.frontierPlan, "frontier"),
    splitA: num(values["split-a"], DEFAULTS.splitA, "split-a"),
    splitB: num(values["split-b"], DEFAULTS.splitB, "split-b"),
  };

  const workhorse = workhorseCost(cfg.inM, cfg.outM, cfg.workhorseIn, cfg.workhorseOut);
  const strategies = [
    { key: "single", name: "single plan", cost: cfg.singlePlan },
    { key: "split", name: "split ($100 + $100)", cost: cfg.splitA + cfg.splitB },
    {
      key: "workhorse",
      name: `frontier + workhorse (${money(cfg.frontierPlan)} + ${money(workhorse)})`,
      cost: cfg.frontierPlan + workhorse,
    },
  ];

  const ranked = [...strategies].sort((a, b) => a.cost - b.cost);
  const best = ranked[0];
  const max = Math.max(...strategies.map((s) => s.cost));

  const crossover = crossoverInputM(cfg);

  if (values.json) {
    console.log(
      JSON.stringify(
        {
          usage: { inputM: cfg.inM, outputM: cfg.outM },
          prices: {
            workhorsePer1MInput: cfg.workhorseIn,
            workhorsePer1MOutput: cfg.workhorseOut,
            singlePlan: cfg.singlePlan,
            frontierPlan: cfg.frontierPlan,
          },
          workhorseCost: Number(workhorse.toFixed(2)),
          strategies: strategies.map((s) => ({
            key: s.key,
            name: s.name,
            monthlyUsd: Number(s.cost.toFixed(2)),
            vsSingleUsd: Number((s.cost - cfg.singlePlan).toFixed(2)),
          })),
          best: best.key,
          crossoverInputM: crossover === null ? null : Number(crossover.toFixed(1)),
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("");
  console.log("  AI coding budget — which split wins?");
  console.log("  " + "─".repeat(58));
  console.log(
    `  usage:     ${label(cfg.inM)} input + ${label(cfg.outM)} output / month`,
  );
  console.log(
    `  workhorse: ${money(cfg.workhorseIn)}/1M in · ${money(cfg.workhorseOut)}/1M out`,
  );
  console.log("");

  for (const s of strategies) {
    const delta = s.cost - cfg.singlePlan;
    const deltaStr =
      delta === 0
        ? "      —"
        : `${delta < 0 ? "-" : "+"}$${Math.abs(delta).toFixed(0)}`.padStart(7);
    const star = s.key === best.key ? " ★" : "  ";
    console.log(
      `  ${s.name.padEnd(38)} $${s.cost.toFixed(0).padStart(4)}  ${deltaStr}${star}`,
    );
    console.log(`  ${" ".repeat(38)} ${bar(s.cost, max)}`);
  }

  console.log("");
  console.log("  " + "─".repeat(58));
  console.log(
    `  winner: ${best.name} at ${money(best.cost)}/mo` +
      (best.key !== "single"
        ? ` — saves ${money(cfg.singlePlan - best.cost)} vs the single plan`
        : ""),
  );

  if (crossover !== null) {
    console.log(
      `  break-even: the workhorse lane stops beating the single plan`,
    );
    console.log(
      `              at ~${crossover.toFixed(0)}M input/month (at this ratio).`,
    );
  }

  console.log("");
  console.log("  ⚠  This assumes your cache holds. Loose routing rules turn the");
  console.log("     cheap lane into your most expensive lane — see routing/cost-model.md.");
  console.log("");
}

main();
