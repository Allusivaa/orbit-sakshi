# Orbit Sakshi — Archive (evidence bundle)

This directory is the self-contained evidence root for Orbit Sakshi v1.0.2.
Everything a stranger needs to verify the chain and rebuild the archived sky
lives here — no network, no npm install, Node 18+ only.

## Layout

    archive/
      receipts/chain.jsonl          12 hash-chained receipts (#0000 genesis ->
                                    #0011 correction: #0007 stands open)
      receipts/0000_genesis.json    standalone genesis record
      receipts/0001_snapshot.json   standalone first-snapshot record
      data/india_objects.json       canonical snapshot (latest ref, receipt #0008)
      pipeline/                     daily fetches, exactly as pulled from CelesTrak
        grp_active.tle              GROUP=active TLE dump      (fetched 2026-08-06/07 UTC)
        name_gslv.tle               NAME=GSLV query            (fetched 2026-08-06/07 UTC)
        name_pslv.tle               NAME=PSLV query            (fetched 2026-08-06/07 UTC)
        name_missing.tle            NAME= missing-objects query (fetched 2026-08-06/07 UTC)
        satcat_raw.csv              full satcat dump           (fetched 2026-08-06/07 UTC)
        omm_aagaman_20260807.json   OMM JSON, AAGAMAN A/B/C    (fetched 2026-08-07 UTC)
        omm2alpha5.mjs              OMM -> Alpha-5 TLE converter (NORAD >= 100000 lane)
        omm_ge100k.mjs              GENERALISED daily OMM lane: SATCAT country-filter
                                    selection (OWNER=IND, on-orbit, NORAD >= 100000) ->
                                    per-ID gp.php CATNR queries -> Alpha-5 conversion.
                                    No names, no hardcoded IDs in the code. (receipt #0008)
        omm_india_ge100k_20260808.json  proof fetch: lane selected {100080,100081,100082}
                                    from the country filter alone and pulled their OMM
                                    (fetched 2026-08-08 UTC)
      rebuild/
        REBUILD.md                  instructions + gap policy + canon contract
        rebuild.mjs                 zero-dependency verifier (chain -> bytes -> sky replay)
        satellite.min.js            vendored satellite.js 4.1.4, sha256-pinned

## Verify

    cd archive
    node rebuild/rebuild.mjs

Exit 0 = chain intact, every latest receipt reference matches the bytes on
disk, and the sky replays to the witnessed hash. Earlier references to
superseded files are reported as historical, not failures. Recorded gaps
(type: missing) and declared omissions (type: known-gap) are first-class
records — the chain has no silent holes. Known-gap status, precisely:
#0005 (TLE exhaustion) closed same-day by #0006. #0007 (post-exhaustion
objects rescued, not auto-ingested) is STANDING OPEN at the operational
level: #0008 shipped and proved the generalised OMM lane (capability
closure), but correction #0011 records that the lane is not yet wired into
the daily archiver — until a wired daily run is witnessed on-chain, the
correct description is "lane shipped and proven, not yet wired into daily
archival".

## v1.0.2 (receipts #0009, #0010)

Two page re-seals, one day:

- **#0009 (v1.0.1)** — index.html advanced from 8d841027...5264d (v1.0) to
  2eeac809...fc6d0b (31,809 bytes): UI/dependency changes including the
  substantive one — satellite.js now loads from the vendored hash-pinned
  rebuild/satellite.min.js instead of cdn.jsdelivr.net, so the map and this
  verifier provably run the same propagator.
- **#0010 (v1.0.2)** — v1.0.1 superseded BEFORE launch. Root cause: the
  mobile label override ran at parse time, before the main script attached
  its change listeners and set allLabels=true; the checkbox flipped, the app
  never heard it, and mobile still rendered every label. Fix: the override
  is a named function invoked at parse, again on window 'load', and once
  more 900 ms after. Desktop default unchanged ("Label everything" stays on).
  Sealed bytes: 2eeac809...fc6d0b -> 482a3b52...311bb4 (31,966 bytes).

Both revisions were authored host-side by the register maintainer and
delivered by the Commander; the build sandbox verified each hash on receipt
and sealed the bytes exactly as provided. Full records: receipts/chain.jsonl.

## Why the deploy root carries its own data/ and rebuild/

The public page (index.html, frozen at sha256 482a3b52...311bb4) fetches
data/india_objects.json from the site root, loads rebuild/satellite.min.js
as its propagator, and links rebuild/REBUILD.md and rebuild/rebuild.mjs
directly. Those root copies are byte-identical to the ones in this archive.
The canonical evidence root is HERE — run the verifier from archive/, where
the full chain and daily fetches sit beside the kit.

Source data: CelesTrak GP, produced by 18th Space Defense Squadron /
USSPACECOM. TLEs are mean elements — not for conjunction assessment or
operational use.
