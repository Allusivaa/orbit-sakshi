# Rebuild this sky yourself

> "Every position on this map has a witness you can rebuild."

This folder is the witness kit. It exists so that claim is checkable by a
stranger, without trusting us. Node.js 18+ is the only requirement — no
`npm install`, no network access. The exact propagator the live map uses
(satellite.js 4.1.4) is vendored here and hash-pinned, so "byte-for-byte"
means the same bytes through the same computation, not a lookalike reimplementation.

## Layout

```
<root>/receipts/chain.jsonl      one JSON receipt per line, hash-chained
<root>/data/india_objects.json   canonical snapshot: TLEs + metadata
<root>/rebuild/rebuild.mjs       the checker (this kit)
<root>/rebuild/satellite.min.js  vendored SGP4 propagator, sha256-pinned
```

The public site ships the same layout (chain + current snapshot + kit).
The full archive repo adds the raw upstream inputs under `pipeline/`
(raw CelesTrak TLE groups, raw satcat) referenced by the genesis receipt.

## Run it

```bash
node rebuild/rebuild.mjs
```

Exit code `0` means everything present verified. It checks, in order:

1. **Chain** — every `receipt_hash` is recomputed from the canonical bytes
   (`sha256` of canonical JSON + newline) and every `prev_hash` link is
   verified back to genesis. Remove or alter one record and every later
   hash breaks. That is what makes a silent hole impossible.
2. **Bytes** — `sha256` of every referenced file present locally matches
   the hash in the receipts. When a path is referenced by several receipts,
   the *latest* one is authoritative for the bytes on disk; earlier
   references are reported as `superseded` — corrections are append-only,
   history is never rewritten.
3. **Sky** — the TLEs in the snapshot are re-propagated with SGP4 at the
   snapshot timestamp (`generated_utc`), canonicalized (WGS-84 geodetic,
   6 decimal places, sorted by NORAD id), and hashed. Run it twice: the
   sky hash is identical every time. Compare the printed sample rows
   against the map paused at the snapshot time.

## What a day is made of

A daily archive entry is the canonical `india_objects.json` for that UTC
day plus one `snapshot` receipt naming its sha256. Rebuilding an archived
day = verifying that receipt chain + that file's hash + replaying SGP4.
Positions are deterministic: same TLEs, same timestamp, same propagator
build — same sky.

Accuracy honesty, restated from the snapshot itself: positions derive from
public TLEs via SGP4 (~1 km median error at 6 h staleness, degrading with
age). This is *catalog truth, not sensor truth*. The witness proves the
catalog was exactly this — not that the sky was.

## Gap policy (decided 2026-08-07, before the first missed day)

The daily archiver will eventually miss a fetch — host restart, network,
upstream API change. Policy:

- **A missed day is written into the chain as a first-class record**,
  hashed and linked like any other:

  ```json
  {"content":{"type":"missing","seq":N,"missing_date":"2026-08-08",
              "reason":"host restart — 00:05Z fetch window missed",
              "detected_at":"2026-08-09T00:07:11Z"},
   "prev_hash":"…","receipt_hash":"…"}
  ```

- A down host cannot write, so the `missing` receipt is appended by the
  **next successful run**, before that run's own `snapshot` receipt — one
  per missed day, each with its reason. `detected_at` records when the gap
  was observed, keeping the timeline honest.
- Reason vocabulary: `host-down`, `network`, `upstream-api`,
  `data-anomaly` (upstream data refused as suspect), `operator` (human
  choice, explained). Free text may follow the dash.
- **The validator treats a recorded gap as an intact chain** and reports
  it by name: `recorded gap: 2026-08-08 — host restart …`.
  A *silent* hole cannot exist: deleting a record breaks every later hash.
- Wording rule that follows: the claim is "**any archived day** rebuildable
  byte-for-byte." A gap day is not archived, and the chain says so, by
  name, with a reason. That is the whole policy: gaps are named, dated,
  reasoned, and hashed — never silent.

### Second record type: `known-gap` (declared scope omissions)

`missing` covers a *day that was not archived*. `known-gap` covers a
*different* failure class: an omission inside the data we did archive —
declared the moment it is understood, before the fix, with its scope:

```json
{"content":{"type":"known-gap","declared_at":"2026-08-07",
            "gap":"…what is missing and why…",
            "scope":"…exactly what is affected…",
            "remediation":"…what closes it…"},
 "prev_hash":"…","receipt_hash":"…"}
```

First use, on record as receipt #0005: the 5-digit TLE catalog exhausted
2026-07-11, so NORAD ≥ 100000 had no TLEs and the TLE-based pipeline
silently missed every object catalogued since — including AAGAMAN A/B/C.
Closed the same day by receipt #0006 (OMM ingest via Alpha-5 encoded TLE
lines, `pipeline/omm2alpha5.mjs`). The validator prints known-gap
declarations with their scope; closures reference the declaration they close.

## Canonicalization contract (for independent re-implementers)

`receipt_hash = sha256( canon({"content": …, "prev_hash": …}) + "\n" )`
where `canon` is byte-compatible with Python
`json.dumps(obj, sort_keys=True, separators=(",",":"), ensure_ascii=True)`:
sorted keys, no spaces, non-ASCII as `\uXXXX` (astral chars as surrogate
pairs). This kit's `canon()` reproduces the genesis hash `1f054806…` from
raw bytes — that recomputation is the proof the contract is exact.
