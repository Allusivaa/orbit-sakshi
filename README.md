# Orbit Sakshi

**A public, verifiable archive of India's orbital catalogue — 181 of 198
on-orbit objects, with the 17-object gap named, dated and explained.**
Live map: https://sakshi.velotrax.in

Orbit Sakshi renders the current Indian orbital catalog on a Cesium globe and,
more importantly, ships the evidence needed to prove what the map showed on any
archived day — without trusting this server, this author, or any third party.

## The core claim

> Anyone can rebuild any archived day, byte for byte, from this repository
> alone — no network, no npm install, Node 18+ only — and verify that the
> receipt chain, the fetched source data, and the rendered sky all agree.

That claim is testable. Run it:

```bash
cd archive
node rebuild/rebuild.mjs
```

Exit 0 means: the hash-chained receipt log is intact, every file the latest
receipts reference matches the bytes on disk, and the sky replays
deterministically to the witnessed hash
(`c8ccfc2f6a6ed4768778c8c1a6dda6cf76edf63dc5100376bb902df088022e1f`
at the snapshot timestamp).

## What is here

| Path | Contents |
|---|---|
| `index.html` | The public page, sealed (see hash below). Zero build step. |
| `data/india_objects.json` | Canonical catalog snapshot served to the map. |
| `tiles/NaturalEarthII/` | 42 vendored Natural Earth II basemap tiles — no third-party tile service. The *verifier* runs fully offline; the *map* does not, because `index.html` loads Cesium.js from cesium.com. |
| `rebuild/` | The verifier kit: `rebuild.mjs`, `REBUILD.md`, and the sha256-pinned vendored `satellite.min.js` (satellite.js 4.1.4) — the same propagator the map runs. |
| `archive/` | The self-contained evidence root: receipt chain, daily CelesTrak fetches exactly as pulled, and the full pipeline including the generalised OMM lane for NORAD ≥ 100000 objects. |
| `MANIFEST.json` | sha256 of every file in the tree. |

## Sealed release — v1.0.3 (current)

| Artifact | sha256 |
|---|---|
| `index.html` | `f0bb29ca890097f9545ef58c42a1ade885856fc1012c24ede36005287f7b8ee5` |
| `orbit_sakshi_v1.0.3.zip` (release asset) | `9aa0befdfc61f53d77fe7964392e1c2be564ba105f1bf2ebbe931239a2569c00` |

Superseded — kept because the chain refers to it:

| v1.0.2 `index.html` | `482a3b52164bde505792868e60cccf0d0fbf939bcb64d35e43fd8ee537311bb4` |
|---|---|
| v1.0.2 `orbit_sakshi_v1.0.2.zip` | `d61d1013f235f1a36dc39f3a1cf4d390881b5073e4f682ac2f45d64f2c128559` |

The release zip is the deployable folder exactly as it sits on the web server.
Verify after download:

```bash
sha256sum orbit_sakshi_v1.0.3.zip        # must match the table above
unzip -d sakshi orbit_sakshi_v1.0.3.zip
cd sakshi/archive && node rebuild/rebuild.mjs   # VERDICT: PASS, exit 0
```

## How the evidence works

- **Receipt chain** (`archive/receipts/chain.jsonl`): every material event —
  genesis, snapshots, corrections, declared gaps, kit versions — is a JSON
  receipt whose hash commits to its content and the previous receipt's hash.
  The chain has no silent holes: omissions are declared as first-class
  `known-gap` records *before* they are fixed, and closed by later receipts.
- **Supersession**: when a file is re-fetched, the newest receipt referencing
  it is authoritative; older references are historical, not failures.
- **Known-gap policy**: e.g. when the 5-digit TLE catalog exhausted in July
  2026 (NORAD ≥ 100000 gets OMM only, never TLEs), the omission was declared
  on-chain the day it was found (#0005) and closed by the receipt that
  shipped OMM ingest (#0006). The follow-on gap — new 6-digit objects still
  not auto-ingested (#0007) — got its generalised country-filter lane in
  #0008, but #0011 corrects the closure: shipped and proven, not yet wired
  into the daily archiver, so #0007 stands open.
- **Propagator discipline**: the map loads the same hash-pinned
  `rebuild/satellite.min.js` the verifier uses. Map and verifier provably run
  identical physics.

## Honesty ledger

- Source data: CelesTrak GP, produced by 18th Space Defense Squadron /
  USSPACECOM. TLEs/OMM are **mean elements — not for conjunction assessment
  or operational use.**
- The archive records its own failures — including its own overclaims.
  Known-gap #0005 (TLE exhaustion) was declared and closed same-day (#0006).
  Known-gap #0007 (post-exhaustion objects rescued, not auto-ingested) is
  **standing open**: receipt #0008 shipped and proved the generalised OMM
  lane, but correction #0011 records that the lane is not yet wired into the
  daily archiver. Until a wired daily run is witnessed on-chain, the correct
  description is "lane shipped and proven, not yet wired into daily archival".
- **Known defect in v1.0.2 — declared here before it is fixed.** The page
  renders *"4 are India's deep-space flagships."* The correct figure is **5**:
  Chandrayaan-1 (33405), Mars Orbiter Mission (39370), Chandrayaan-2 (44441),
  Aditya-L1 (57754), Chandrayaan-3 Propulsion Module (57770) — exactly as
  receipt #0001 records. Cause: the count matches catalog *names* against the
  acronym `MOM`, which does not occur in the string `MARS ORBITER MISSION`, so
  Mangalyaan is silently dropped. Found 2026-08-08 by auditing the rendered
  page against the chain; the chain was right and the page was wrong. The
  sealed v1.0.2 tree is **not** edited — it is a true record of what shipped,
  defect included. The fix (match on NORAD id, never on an upstream-controlled
  name) shipped the same night as **v1.0.3**, recorded as correction receipt
  **#0012** (`cd513f6e…168be4`). The declaration above is left standing: it was
  published before the fix existed, and deleting it would be the exact silent
  edit this project refuses to make.
- Two latent defects of the same family, recorded at the same audit: the
  receipt panel carries the hardcoded string "genesis + 6 receipts" while this
  chain holds 12, and `inBas()` hardcodes the 400–450 km band that
  `bas_band_km` already owns in the data. Neither renders a wrong number
  today. Both closed in v1.0.3 by the same receipt #0012: `inBas()` now reads
  `snap.bas_band_km`, and the panel states the chain it ships with.
- Version history: v1.0 (`546e58d9…f0e83` zip) → v1.0.1 (`7679d2a8…da7898`
  zip, superseded pre-launch by a mobile label-timing bug, recorded on-chain)
  → v1.0.2 (`d61d1013…128559` zip, superseded the same night by the
  deep-space-count defect above) → **v1.0.3** (this tree, 13 receipts).

## Author

Built and maintained by **Velotrax** — Shiva Allu, Hyderabad.
Issues and verification reports welcome.

*No timestamps in this repository are OpenTimestamp-stamped in-repo; OTS
stamping is founder-executed and published separately.*
