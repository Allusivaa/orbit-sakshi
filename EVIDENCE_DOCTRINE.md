# VELOTRAX EVIDENCE DOCTRINE
*Standing rules. Both officers bound. Established 2026-08-04; ratifies and extends the founding rule.*

## Rule 1 — The hash rule (founding)
**"If you can't independently rebuild the hash, it doesn't ship."**
Applies to sealed artifacts, manifests, verdicts, timestamps.

## Rule 2 — The citation rule (2026-08-04)
**No research artifact leaves the building until every load-bearing citation has been OPENED, not summarised.**
Same shape as the hash rule, applied to prose: a citation you have not opened is a hash you have not rebuilt.

**Measured base rate (why this rule exists):** the first citation audit under this rule — a 3-page forensics note assembled from research summaries — produced **4 defects and 1 inversion** (a primary source that said the opposite of what the artifact claimed). 2026-08-04. This rate applies to any agent, human or AI, no exceptions claimed.

**Procedure:**
1. Identify load-bearing claims: anything with a number, a name, a document ID, a quote, or a causal assertion a reviewer could check.
2. Open the primary source for each. Not a search snippet — the document.
3. Mark every claim: **VERIFIED** (source opened, wording/number matches) / **SOFTENED** (direction right, precision wrong — rewrite to the defensible form) / **CUT** (unverifiable or contradicted).
4. Artifact carries a verification footer: date + "all claims verified against the cited primary sources."
5. Inversions and CUTs are reported against ourselves in the delivery message, not silently fixed. The rule working is visible or it isn't working.

**Scope:** every research artifact — notes, DMs, whitepapers, decks, live web pages, investor material. Applies retroactively to artifacts already public (audit log below).

## Audit log
| date | artifact | result |
|---|---|---|
| 2026-08-04 | EMBRACE_TELEMETRY_FORENSICS_NOTE (v2→v3) | 4 defects + 1 inversion found and fixed (Galileo 10× number CUT — transplant from Hughes grease test; Philae/ROMAP INVERTED — ROMAP showed NO ignition-current signature, silence was the evidence; "Apollo 15 2–3×" CUT, replaced INTELSAT V + ERBS; Rivera & Stewart attribution fixed; ECSS factor-3 VERIFIED verbatim). v3 ships only after Claude's read. |
| 2026-08-04 | live.velotrax.in mission-economics block | Citation SSC26-FT-75 (Shambaugh / Leonid Space, SmallSat 2026) VERIFIED REAL — arXiv:2606.24687. Claim "Solar Cycle 25 ran 2–3× above forecast" IMPRECISE — 2–3× is atmospheric density held 2022–2026, not the cycle's sunspot number (~1.4×); precision fix drafted. "Billions in mission-years" SUPPORTED — paper quantifies $0.88B / 688 mission-yrs (vs 2σ-high) and $2.77B / 2,472 mission-yrs (vs nominal); recommend citing real numbers. Site source not in agent workspace — edit path via Commander. |
| 2026-08-04 | DGCA figures (deck) | NOT AUDITABLE agent-side — no DGCA-bearing deck in agent stores (ARTPARK deck clean; Genesis whitepaper binary false-positive). Awaiting Commander to point at the file. |

## Held-artifact register
| artifact | status | release condition |
|---|---|---|
| EMBRACE_TELEMETRY_FORENSICS_NOTE v3 (PDF sha256 66660c74…9cb7f) | HELD | Chiran replies with a technical question ("want it?" — invited) OR T-Hub warm intro / in-person if >2 weeks silence; Claude reads v3 before any send. v2 PDF VOID (sha ca76f3af…4c20 — agent-side copies confirmed zeroed 2026-08-04; Commander's local download to be deleted/renamed VOID_). |
