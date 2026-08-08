#!/usr/bin/env node
/*
 * omm_ge100k.mjs — generalised OMM lane for post-exhaustion catalog objects
 * -------------------------------------------------------------------------
 * Why this exists: the 5-digit TLE catalog exhausted 2026-07-11. CelesTrak
 * serves NO TLE for NORAD >= 100000 — OMM only. Known-gap #0005 was closed
 * by a one-off targeted fetch; this lane makes the rescue GENERAL and
 * DAILY-DRIVEABLE: every object owned by the filtered country at
 * NORAD_CAT_ID >= 100000 is selected straight from the satcat CSV and
 * pulled as OMM — no object names and no catalog IDs appear in this file.
 *
 * Selection contract (the SATCAT country filter, nothing else):
 *   OWNER == --owner   AND   DECAY_DATE empty (on-orbit)   AND   NORAD_CAT_ID >= --min-norad
 *
 * Upstream contract (CelesTrak policy-aware): gp.php rejects multi-ID
 * CATNR lists ("not an integer"), and pulling GROUP=active as JSON
 * (~12 MB) to keep 3 objects is 99.9% wasted upstream bandwidth. So the
 * lane issues ONE single-object CATNR query per selected object per day,
 * sequentially, with a polite delay — at current catalog size that is a
 * few hundred bytes a day, far inside CelesTrak's one-fetch-per-2-hours-
 * per-query guidance. Non-200 => halt and alert a human, never retry-loop.
 * If the post-exhaustion population ever grows large, switch FETCH_MODE
 * to "group" (one GROUP=active&FORMAT=json pull, filtered locally).
 *
 * Usage:
 *   node omm_ge100k.mjs satcat.csv --select-only
 *       print selected catalog IDs + the exact daily query URL(s)
 *   node omm_ge100k.mjs satcat.csv --out omm_subset.json [--out-tle tle.json]
 *       live mode: run the daily queries, archive the subset JSON,
 *       emit Alpha-5 TLE pairs
 *   node omm_ge100k.mjs satcat.csv --from-file raw_omm.json [--out subset.json] [--out-tle tle.json]
 *       offline mode: same selection + conversion against a previously
 *       fetched file (array of raw OMM objects as served)
 *
 * Zero npm dependencies. Node 18+ (global fetch for live mode).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { ommToTle } from "./omm2alpha5.mjs";

const GP = "https://celestrak.org/NORAD/elements/gp.php";
const FETCH_MODE = "per-id";          // "per-id" | "group" — see header
const POLITE_DELAY_MS = 1500;         // between upstream calls
const catnrUrl = id => GP + "?CATNR=" + id + "&FORMAT=json";
const GROUP_URL = GP + "?GROUP=active&FORMAT=json";

function arg(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : dflt;
}
const satcatPath = process.argv[2];
if (!satcatPath || satcatPath.startsWith("--")) {
  console.error("usage: node omm_ge100k.mjs <satcat.csv> [--owner IND] [--min-norad 100000] " +
                "[--select-only | --out omm.json | --from-file omm.json [--out-tle tle.json]]");
  process.exit(2);
}
const OWNER = arg("--owner", "IND");
const MIN_NORAD = parseInt(arg("--min-norad", "100000"), 10);

/* minimal RFC-4180-ish CSV reader (quoted fields, no embedded newlines in satcat) */
function parseCsv(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const fields = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { fields.push(cur); cur = ""; }
      else cur += c;
    }
    fields.push(cur);
    rows.push(fields);
  }
  return rows;
}

const rows = parseCsv(readFileSync(satcatPath, "utf8"));
const hdr = rows[0];
const col = Object.fromEntries(hdr.map((h, i) => [h.trim(), i]));
for (const need of ["NORAD_CAT_ID", "OWNER", "DECAY_DATE"]) {
  if (!(need in col)) { console.error("satcat missing column: " + need); process.exit(2); }
}

const selected = [];
for (let r = 1; r < rows.length; r++) {
  const f = rows[r];
  const norad = parseInt(f[col.NORAD_CAT_ID], 10);
  if (!Number.isFinite(norad) || norad < MIN_NORAD) continue;
  if (f[col.OWNER].trim() !== OWNER) continue;
  if (f[col.DECAY_DATE].trim() !== "") continue;        // decayed -> not on-orbit
  selected.push(norad);
}
selected.sort((a, b) => a - b);

const queryUrls = FETCH_MODE === "group" ? [GROUP_URL] : selected.map(catnrUrl);

if (process.argv.includes("--select-only")) {
  console.log(JSON.stringify({ owner: OWNER, min_norad: MIN_NORAD, count: selected.length,
                               norad_cat_ids: selected, fetch_mode: FETCH_MODE,
                               daily_queries: queryUrls }, null, 1));
  process.exit(0);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
let ommAll;
const fromFile = arg("--from-file", null);
if (fromFile) {
  ommAll = JSON.parse(readFileSync(fromFile, "utf8"));
} else {
  ommAll = [];
  for (const u of queryUrls) {
    const resp = await fetch(u, { headers: { "User-Agent": "orbit-sakshi-archiver/1.0 (daily fetch)" } });
    if (!resp.ok) {                                     // CelesTrak policy: stop-and-alert-human
      console.error("HALT: upstream returned HTTP " + resp.status + " for " + u);
      console.error("Policy: do not retry in a loop. Investigate before the next fetch.");
      process.exit(3);
    }
    ommAll.push(...await resp.json());
    await sleep(POLITE_DELAY_MS);
  }
}

/* keep only what the selection asked for — upstream answer is checked, not trusted */
const want = new Set(selected.map(String));
const got = ommAll.filter(o => want.has(String(o.NORAD_CAT_ID)));
const missing = selected.filter(n => !got.some(o => String(o.NORAD_CAT_ID) === String(n)));

const out = arg("--out", null);
if (out) {
  writeFileSync(out, JSON.stringify({ fetched_utc: new Date().toISOString(), fetch_mode: FETCH_MODE,
                                      daily_queries: queryUrls, owner: OWNER,
                                      min_norad: MIN_NORAD, selected, omm: got }, null, 1) + "\n");
}

const tle = got.map(o => ({ norad: o.NORAD_CAT_ID, name: o.OBJECT_NAME,
                            epoch: o.EPOCH, ...ommToTle(o) }));

const outTle = arg("--out-tle", null);
const report = { owner: OWNER, min_norad: MIN_NORAD, selected: selected.length,
                 received: got.length, missing_upstream: missing, tle };
if (outTle) writeFileSync(outTle, JSON.stringify(report, null, 1) + "\n");
else console.log(JSON.stringify(report, null, 1));
if (missing.length) {
  console.error("WARN: " + missing.length + " selected object(s) absent from upstream OMM: " + missing.join(","));
  process.exit(4);
}
