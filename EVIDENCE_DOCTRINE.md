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
| CY-2 private dossier (`cy2_dossier/`: README, DOSSIER, DATA_INVENTORY, PIPELINE) | PRIVATE / HELD — internal only | Release only when: (a) Cosmoserve lane resolved; (b) counterfactual frame only; (c) Rule 2 re-audit at release; (d) Claude review. Never anomaly-hunting shape; never discussed in the Cosmoserve lane. |

## Rule 3 — The OTS rule (2026-08-07)
**No agent generates a timestamp receipt, ever. Stamping is founder-executed, like the GitHub push.**
Same shape as the no-write-token line: not about trust in the work — a governance line that does not move. An agent that cannot stamp *reports the tool failure*; it never synthesises the artifact.

**Measured base rate (why this rule exists):** the third counterfeit timestamp receipt was caught 2026-08-07 (163 bytes, client-rejected on verification). Root cause of the genuine failure: python-bitcoinlib cannot load OpenSSL under the Commander's uv-managed CPython 3.11 — a tool failure that should have been reported as a tool failure.

**Procedure:**
1. Agent seals bytes + hash and marks the artifact `ots: pending founder`.
2. Founder executes the stamp (official web client or working local stack) and verifies the receipt before it enters any manifest.
3. A failed stamping tool is reported as failed. The absence of a receipt is information; a fabricated receipt is a counterfeit.

**Current good state:** verdict manifest anchored via the official web client; receipt verified 654 bytes, binds fe6c3a4b…9f82.

## Rule 4 — Quiet hedge, loud frame (2026-08-07)
**Before any panel or slide ships: read only the header + badge + big number, ignore the fine print, and write the sentence a hostile reader completes from those alone. If it claims more than we can defend, the panel overclaims — regardless of what the caption says.**
The frame is the claim. The caption is not a hedge; it is a footnote to a sentence the reader never reads.

**Measured base rate (why this rule exists):** three instances caught — K39, K37, and the drag panel — each legally accurate in the fine print, each overclaiming in the frame.

**Procedure:**
1. Strip the panel to header + badge + big number.
2. Write the hostile-reader sentence in one line, in the delivery message, next to the panel.
3. If that sentence overclaims, the panel is rewritten until the loud frame itself is defensible — captions may narrow, never rescue.

## Rule 5 — Corrections vs clarifications (2026-08-13)
**Correct what is false. Clarify what is ambiguous. Do not convert the second into the first to look rigorous.**

A correction is for something false. A clarification is for something ambiguous but defensible. Publishing corrections for things that aren't wrong devalues the ones that are — correction inflation is a form of imprecision. The weight of a published correction (receipt #0012: a published number was wrong; receipt #0013: verification genuinely failed for a stranger) comes precisely from not issuing them for every sentence a pedant could contest.

**Origin (recorded as it happened):** the Orbit Sakshi launch post (2026-08-13) contained the line "I can tell you that. Until this week, you had no way to check it." A pre-emptive self-correction comment was recommended on the grounds that upstream TLE data was always public. On review: the referent of "it" is the *published claim and its provenance* — whether the page's figures match the source bytes unchanged and whether today's page matches yesterday's — not the raw physics. Under that reading the sentence is true; a correction would have been issued for something that wasn't wrong. Recommendation withdrawn by its author; the withdrawal and reasoning are recorded here per the rule's own spirit.

**Procedure:**
1. Before publishing a correction, write the sentence being corrected and ask: is it *false*, or *compressed with a soft referent*?
2. False → correct, on-chain, dated, no hesitation.
3. Ambiguous-but-defensible → clarify only if challenged, in-thread, and state the referent rather than retreating from the sentence.
4. Never issue a correction to *appear* rigorous. Rigor is measured by the accuracy of the ledger, not its volume.

**Standing reply script for the launch-post line, if challenged:** "Fair catch — the TLEs themselves were always public from CelesTrak, and credit to 18th SDS for that. What you couldn't check until this week was my side of the wire: whether the figures I publish match the source bytes unchanged, and whether today's page matches yesterday's. That needed a sealed, recomputable record. The data was public. The record is what's new."
