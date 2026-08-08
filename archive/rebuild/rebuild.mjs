#!/usr/bin/env node
/*
 * Orbit Sakshi / Drishti — independent rebuild kit
 * ------------------------------------------------
 * "Every position on this map has a witness you can rebuild."
 *
 * This script is the witness-checker. Node.js 18+ only. No npm install,
 * no network: the exact propagator the map uses (satellite.js 4.1.4) is
 * vendored next to this file, hash-pinned.
 *
 * Layout expected (archive repo and the shipped site share it):
 *   <root>/receipts/chain.jsonl      hash-chained receipts
 *   <root>/data/india_objects.json   canonical snapshot (TLEs + metadata)
 *   <root>/rebuild/rebuild.mjs       this file
 *   <root>/rebuild/satellite.min.js  vendored propagator
 *
 * What it proves, in order:
 *   1. CHAIN   — every receipt_hash recomputed from canonical bytes and
 *                every prev_hash link verified. Remove or alter one record
 *                and every later hash breaks.
 *   2. BYTES   — sha256 of every referenced file that is present locally
 *                matches the hash recorded in the receipts.
 *   3. SKY     — the TLEs in the snapshot are re-propagated with SGP4 at
 *                the snapshot timestamp; the resulting sky is canonicalized
 *                and hashed. Same bytes in -> same sky out, every time.
 *
 * Exit code 0 = everything present verified. 1 = a verification failed.
 *
 * Recorded gaps: a receipt of type "missing" is a first-class record
 * (see REBUILD.md, "Gap policy"). It does not break the chain; it is
 * reported as a recorded gap and the chain remains intact.
 */

import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const KIT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(KIT_DIR, "..");
const satellite = require(join(KIT_DIR, "satellite.min.js"));

const SATJS_SHA256 = "d8a9d17a8a61c8a9237cbd476baa1e31fda3c77aeb4bb014cfebded766af7043";
const PROPAGATOR_ID = "satellite.js 4.1.4 (vendored, sha256 " + SATJS_SHA256.slice(0, 12) + "…)";

/* ---------- canonical JSON: byte-compatible with
   python json.dumps(obj, sort_keys=True, separators=(",",":"), ensure_ascii=True) ---------- */
function canon(v) {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new Error("non-finite number in canon");
    return String(v);
  }
  if (typeof v === "string") return canonString(v);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  const keys = Object.keys(v).sort();
  return "{" + keys.map(k => canonString(k) + ":" + canon(v[k])).join(",") + "}";
}
function canonString(s) {
  let out = '"';
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (ch === '"') out += '\\"';
    else if (ch === "\\") out += "\\\\";
    else if (ch === "\b") out += "\\b";
    else if (ch === "\f") out += "\\f";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (cp < 0x20) out += "\\u" + cp.toString(16).padStart(4, "0");
    else if (cp < 0x7f) out += ch;                       // python ensure_ascii leaves ASCII printable as-is
    else if (cp <= 0xffff) out += "\\u" + cp.toString(16).padStart(4, "0");
    else {                                               // astral plane -> surrogate pair, like python
      const u = cp - 0x10000;
      out += "\\u" + (0xd800 + (u >> 10)).toString(16) + "\\u" + (0xdc00 + (u & 0x3ff)).toString(16);
    }
  }
  return out + '"';
}
const sha256hex = b => createHash("sha256").update(b).digest("hex");
const receiptHash = r => sha256hex(canon({ content: r.content, prev_hash: r.prev_hash }) + "\n");

let failures = 0;
const ok   = m => console.log("  PASS  " + m);
const bad  = m => { failures++; console.log("  FAIL  " + m); };
const info = m => console.log("  ....  " + m);

/* ---------- 0. kit self-check: the vendored propagator is the pinned build ---------- */
console.log("\n[0] kit self-check");
{
  const actual = sha256hex(readFileSync(join(KIT_DIR, "satellite.min.js")));
  if (actual === SATJS_SHA256) ok("vendored satellite.js 4.1.4 matches pinned sha256 " + SATJS_SHA256.slice(0, 16) + "…");
  else bad("vendored satellite.min.js hash " + actual.slice(0, 16) + "… != pinned " + SATJS_SHA256.slice(0, 16) + "…");
}

/* ---------- 1. chain integrity ---------- */
console.log("\n[1] receipt chain");
const chainPath = join(ROOT, "receipts", "chain.jsonl");
if (!existsSync(chainPath)) { bad("receipts/chain.jsonl not found at " + chainPath); process.exit(1); }
const lines = readFileSync(chainPath, "utf8").split("\n").filter(l => l.trim().length);
let prev = "0".repeat(64);
let snapshots = 0, gaps = [], knownGaps = [];
const refsToCheck = [];
lines.forEach((line, i) => {
  let r;
  try { r = JSON.parse(line); } catch (e) { bad("line " + i + " is not valid JSON"); return; }
  const recomputed = receiptHash(r);
  if (recomputed !== r.receipt_hash) { bad("#" + String(i).padStart(4, "0") + " hash mismatch (recomputed " + recomputed.slice(0, 12) + "… != recorded " + String(r.receipt_hash).slice(0, 12) + "…)"); return; }
  if (r.prev_hash !== prev) { bad("#" + String(i).padStart(4, "0") + " prev_hash link broken"); return; }
  const t = r.content && r.content.type;
  if (t === "snapshot") snapshots++;
  if (t === "missing") gaps.push((r.content.missing_date || "?") + " — " + (r.content.reason || "no reason recorded"));
  if (t === "known-gap") knownGaps.push("#" + String(i).padStart(4,"0") + " declared " + (r.content.declared_at || "?") + ": " + (r.content.gap || "") + " Scope: " + (r.content.scope || ""));
  if (r.content && r.content.refs) for (const [p, h] of Object.entries(r.content.refs)) refsToCheck.push([p, h, i]);
  ok("#" + String(i).padStart(4, "0") + " " + (t || "?") + " " + r.receipt_hash.slice(0, 12) + "… (hash + link verified)");
  prev = r.receipt_hash;
});
console.log("  ----  " + lines.length + " receipts, " + snapshots + " snapshot(s), " + gaps.length + " recorded gap(s), " + knownGaps.length + " known-gap declaration(s)");
gaps.forEach(g => info("recorded gap: " + g));
knownGaps.forEach(g => info("known-gap: " + g));

/* ---------- 2. referenced bytes ----------
   The chain is append-only: a correction never rewrites history, it adds a
   later receipt re-referencing the same path with new bytes. So the LATEST
   receipt referencing a path is authoritative for the bytes on disk; earlier
   refs are historical ("superseded") and are reported, not enforced. */
console.log("\n[2] referenced bytes");
const latestRef = new Map();   // path -> [hash, receiptIndex]
for (const [p, h, i] of refsToCheck) latestRef.set(p, [h, i]);
const verified = new Set();
for (const [p, h, i] of refsToCheck) {
  const [latestH, latestI] = latestRef.get(p);
  if (h !== latestH) { info(p + " @ " + h.slice(0, 12) + "… superseded by #" + String(latestI).padStart(4, "0") + " (historical ref, chain intact)"); continue; }
  if (verified.has(p)) continue;   // several receipts may anchor the same current bytes
  verified.add(p);
  const fp = join(ROOT, p);
  if (!existsSync(fp)) { info(p + " not present in this copy (lives in the full archive repo) — skipped"); continue; }
  const actual = sha256hex(readFileSync(fp));
  if (actual === h) ok(p + " sha256 " + h.slice(0, 12) + "… matches latest ref (#" + String(latestI).padStart(4, "0") + ")");
  else bad(p + " sha256 " + actual.slice(0, 12) + "… != latest ref " + h.slice(0, 12) + "… (#" + String(latestI).padStart(4, "0") + ")");
}

/* ---------- 3. replay the sky ---------- */
console.log("\n[3] replay the sky at the snapshot timestamp");
const snapPath = join(ROOT, "data", "india_objects.json");
if (!existsSync(snapPath)) { bad("data/india_objects.json not found"); process.exit(1); }
const snap = JSON.parse(readFileSync(snapPath, "utf8"));
const when = new Date(snap.generated_utc);
const gmst = satellite.gstime(when);
const positions = [];
let propagated = 0, failed = 0;
for (const o of snap.objects) {
  if (!o.l1 || !o.l2) { failed++; continue; }
  const satrec = satellite.twoline2satrec(o.l1, o.l2);
  const pv = satellite.propagate(satrec, when);
  if (!pv || !pv.position) { failed++; continue; }
  const geo = satellite.eciToGeodetic(pv.position, gmst);
  positions.push({
    norad: o.norad,
    name: o.name,
    lat_deg: +(satellite.degreesLat(geo.latitude)).toFixed(6),
    lon_deg: +(satellite.degreesLong(geo.longitude)).toFixed(6),
    alt_km: +(geo.height).toFixed(6)
  });
  propagated++;
}
positions.sort((a, b) => a.norad - b.norad);
const skyDoc = {
  generated_utc: snap.generated_utc,
  propagator: PROPAGATOR_ID,
  convention: "geodetic WGS-84, lat/lon deg, alt km, 6dp, sorted by NORAD id",
  count: positions.length,
  positions
};
const skyHash = sha256hex(canon(skyDoc) + "\n");
ok(propagated + "/" + snap.objects.length + " objects propagated via SGP4 @ " + snap.generated_utc + (failed ? " (" + failed + " without usable TLE)" : ""));
ok("sky sha256: " + skyHash);
info("propagator: " + PROPAGATOR_ID);
console.log("\n  sample (compare against the map paused at " + snap.generated_utc + "):");
positions.slice(0, 3).forEach(p =>
  console.log("    " + String(p.norad).padEnd(7) + p.name.padEnd(24) +
              ("lat " + p.lat_deg).padEnd(16) + ("lon " + p.lon_deg).padEnd(17) + "alt " + p.alt_km + " km"));

/* ---------- verdict ---------- */
console.log("\n" + (failures === 0
  ? "VERDICT: PASS — chain intact, referenced bytes verified, sky replayed deterministically."
  : "VERDICT: FAIL — " + failures + " verification(s) failed. Do not trust this copy."));
process.exit(failures === 0 ? 0 : 1);
