# Orbit Sakshi v1.0.2 — release notes (paste as the GitHub Release body)

**Deploy-ready zip. The page's core claim depends on this artifact: anyone can
rebuild any archived day from the zip alone and verify the receipt chain, the
source fetches, and the rendered sky.**

## Asset

| | |
|---|---|
| File | `orbit_sakshi_v1.0.2.zip` |
| Size | 2,941,605 bytes (66 entries) |
| sha256 | `d61d1013f235f1a36dc39f3a1cf4d390881b5073e4f682ac2f45d64f2c128559` |
| MD5 | `deb2321463ff9e8b16ad3a1a4cea612e` |
| Sealed page (`index.html`) | `482a3b52164bde505792868e60cccf0d0fbf939bcb64d35e43fd8ee537311bb4` (31,966 bytes) |

## Verify (offline, Node 18+)

```bash
sha256sum orbit_sakshi_v1.0.2.zip      # must equal the sha256 above
unzip -d sakshi orbit_sakshi_v1.0.2.zip
cd sakshi/archive
node rebuild/rebuild.mjs               # VERDICT: PASS, exit 0
```

## What changed (v1.0.1 → v1.0.2)

- **Mobile label-timing fix.** Root cause: the mobile label override ran at
  parse time, before the main script attached its change listeners and set
  `allLabels = true`. The checkbox flipped; the app never heard it — mobile
  still rendered every label. Fix: the override is now a named function
  invoked at parse, again on window `load`, and once more 900 ms after, so it
  lands whether the app reads the checkbox at init or listens for change.
  Desktop default unchanged: "Label everything" stays on (standing doctrine).
- v1.0.1 (`7679d2a8…da7898`) was superseded before launch by this fix; the
  supersession and the root cause are recorded on-chain (receipt #0010).

## Carried from v1.0.1

- satellite.js loads from the vendored hash-pinned `rebuild/satellite.min.js`
  (not a CDN): map and verifier provably run the same propagator.
- Collapsible receipt panel; mobile layout overhaul.
- Receipt chain: 11 receipts at seal, including the generalised OMM lane for
  NORAD ≥ 100000 objects (country-filter selection, no hardcoded IDs). The
  canonical chain lives in this repository (`archive/receipts/chain.jsonl`)
  and may be newer — supersession is by latest receipt. Note: receipt #0011
  (in the repo chain, after the zip was sealed) corrects #0008's closure of
  known-gap #0007 — the OMM lane is shipped and proven but not yet wired
  into the daily archiver; #0007 stands open at the operational level.

## Integrity notes

- Source data: CelesTrak GP (18th Space Defense Squadron / USSPACECOM).
  Mean elements — not for conjunction assessment or operational use.
- Chain has no silent holes: known gaps are declared before they are fixed.
- **Known defect in this release.** The page renders "4 are India's deep-space
  flagships"; the correct figure is 5 — the count matches catalog names against
  the acronym `MOM`, which does not occur in `MARS ORBITER MISSION`, so
  Mangalyaan is dropped. Receipt #0001 has it right. Found by audit on
  2026-08-08, declared here rather than quietly patched. v1.0.2 is not edited:
  it is a true record of what shipped. Fixed forward in v1.0.3 with a
  correction receipt. See the README honesty ledger for the full entry.
- This GitHub release is the permanent home for the artifact.
