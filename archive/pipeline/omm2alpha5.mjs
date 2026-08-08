#!/usr/bin/env node
/*
 * omm2alpha5.mjs — CelesTrak OMM (JSON) -> Alpha-5 TLE lines
 * ----------------------------------------------------------
 * Why this exists: the 5-digit TLE catalog exhausted 2026-07-11 (Saramago
 * = 100000). CelesTrak serves NO TLE for NORAD >= 100000 — OMM/CSV/JSON
 * only. This converter maps OMM fields onto TLE lines using the Alpha-5
 * satellite-number encoding (A=10xxxx … Z=33xxxx, skipping I and O), so
 * the existing satellite.js lane ingests post-exhaustion objects with
 * zero changes downstream.
 *
 * Field semantics (CCSDS OMM == TLE): MEAN_MOTION_DOT is n-dot/2 and
 * MEAN_MOTION_DDOT is n-ddot/6 — exactly the TLE line-1 fields, copied
 * directly. Checksum: digits count face value, '-' counts 1, all else 0
 * (the Alpha-5 letter counts 0), mod 10.
 *
 * Usage: node omm2alpha5.mjs omm.json   (OMM JSON = array as served by
 *        gp.php?FORMAT=json)  -> prints "l1"/"l2" pairs as JSON to stdout.
 */
import { readFileSync } from "node:fs";

const ALPHA5 = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // I and O skipped
function alpha5(n) {
  if (n < 100000) return String(n).padStart(5, "0");
  const hi = Math.floor(n / 10000);          // 10..33
  if (hi > 33) throw new Error("Alpha-5 range exceeded: " + n);
  return ALPHA5[hi - 10] + String(n % 10000).padStart(4, "0");
}
const pad = (s, n) => String(s).padStart(n, " ");
function expField(v) {                       // TLE implied-exponent: 0.mantissa e exp
  if (!v) return " 00000-0";
  const ex = Math.floor(Math.log10(Math.abs(v))) + 1;          // 0.1 <= 0.mant < 1
  let mant = Math.round(Math.abs(v) / Math.pow(10, ex - 5));   // 5 digits of 0.mant
  let e2 = ex;
  if (mant >= 100000) { mant = 99999; }                        // clamp, never carry
  return (v < 0 ? "-" : " ") + String(mant).padStart(5, "0") + (e2 < 0 ? "-" : "+") + Math.abs(e2);
}
function doyFrac(iso) {
  const d = new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : iso + "Z");  // OMM epochs are UTC
  const y = d.getUTCFullYear();
  const start = Date.UTC(y, 0, 1);
  const doy = Math.floor((d - start) / 86400000) + 1;
  const frac = ((d - start) % 86400000) / 86400000;
  return { yy: String(y).slice(2), day: (doy + frac).toFixed(8).padStart(12, "0") };
}
function checksum(line) {
  let s = 0;
  for (const c of line.slice(0, 68)) {
    if (c >= "0" && c <= "9") s += +c;
    else if (c === "-") s += 1;
  }
  return s % 10;
}
export function ommToTle(o) {
  const sat = alpha5(o.NORAD_CAT_ID);
  const { yy, day } = doyFrac(o.EPOCH);
  const m = /^(\d{4})-(\d{3})(\w*)$/.exec(o.OBJECT_ID);      // 2026-164A -> YY=26 LLL=164 AAA=A
  if (!m) throw new Error("unexpected OBJECT_ID: " + o.OBJECT_ID);
  const idY = m[1].slice(2), idN = m[2], idP = (m[3] + "   ").slice(0, 3);
  const ndot = (o.MEAN_MOTION_DOT >= 0 ? " ." : "-.") + Math.abs(o.MEAN_MOTION_DOT).toFixed(8).slice(2);
  const l1 = "1 " + sat + (o.CLASSIFICATION_TYPE || "U") + " " +
             idY + idN + idP + " " + yy + day + " " + ndot + " " +
             expField(o.MEAN_MOTION_DDOT) + " " + expField(o.BSTAR) + " " +
             String(o.EPHEMERIS_TYPE) + " " + pad(o.ELEMENT_SET_NO, 4);
  const f8 = v => Number(v).toFixed(4).padStart(8, " ");
  const l2 = "2 " + sat + " " + f8(o.INCLINATION) + " " + f8(o.RA_OF_ASC_NODE) + " " +
             Math.round(o.ECCENTRICITY * 1e7).toString().padStart(7, "0") + " " +
             f8(o.ARG_OF_PERICENTER) + " " + f8(o.MEAN_ANOMALY) + " " +
             Number(o.MEAN_MOTION).toFixed(8).padStart(11, " ") + pad(o.REV_AT_EPOCH, 5);
  return { l1: l1 + checksum(l1), l2: l2 + checksum(l2) };
}

if (process.argv[1] && process.argv[1].endsWith("omm2alpha5.mjs")) {
  const omm = JSON.parse(readFileSync(process.argv[2], "utf8"));
  const out = omm.map(o => ({ name: o.OBJECT_NAME, norad: o.NORAD_CAT_ID,
                              epoch: o.EPOCH, ...ommToTle(o) }));
  console.log(JSON.stringify(out, null, 1));
}
