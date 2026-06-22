# Meta (Facebook / Instagram) Ad-Account Restriction Prevention

**Status:** PROPOSED — awaiting manager approval. Nothing below is implemented yet.
**Scope:** Disclaimer + policy text to add to the website (legal pages + footer). Does **not** change the offer, pricing, or funnel.

---

## Why this matters

Health / weight-loss / metabolic offers are a sensitive category for Meta. Ad accounts get flagged or disabled most often for:

1. **Implying knowledge of a person's health** — e.g. "Are you diabetic?", "Your HbA1c is high" in ad copy.
2. **Promising or guaranteeing health outcomes** — "reduce your sugar by X", before/after body claims presented as typical.
3. **Weak or missing privacy policy on sensitive (health) data** — Meta requires a clear privacy policy, especially for health-adjacent advertisers.
4. **Using FB/IG trademarks without an independence disclaimer.**

Adding the language below **materially reduces restriction risk** and is effectively required for this category. It also strengthens any **appeal** if the account is ever actioned.

> ⚠️ **Honest caveat:** These site-side disclaimers do **not guarantee** approval. The single biggest lever is the **ad creative itself** (ad text + images in Ads Manager), which must avoid personal-health claims and non-compliant before/after imagery per Meta policy. That lives on the media-buying side, not in this codebase.

---

## What to add — 5 items

### 1. Medical Disclaimer
**Where:** New section in **Terms & Conditions** + a one-line version in the **site footer**.

> All content, programs, and consultations provided by Innohealth are for **educational and informational purposes only** and are **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult your physician or a qualified healthcare provider before making any changes to your health, medication, nutrition, or lifestyle. Never disregard or delay seeking professional medical advice because of content accessed through this website.

---

### 2. Results / Earnings Disclaimer
**Where:** New section in **Terms & Conditions** + a short mirrored note **under the testimonials** section on the landing page.

> Results vary from person to person. The experiences and outcomes shared on this website are **individual results and are not a guarantee** that you will achieve the same or similar results. Outcomes depend on multiple factors including your starting health, consistency, medical history, and lifestyle. Testimonials are illustrative of individual experiences only and should not be considered typical or guaranteed.

---

### 3. Privacy Policy — Sensitive Health Data + Advertising clause  ⭐ (most important for Meta)
**Where:** New clause in the **Privacy Policy**.

> Any health-related information you share with us is treated as **sensitive personal data**. It is used solely to deliver your consultation and the services you purchased, and is **never sold or shared with advertising platforms for ad-targeting purposes**. We do not use sensitive health data to build, define, or target advertising audiences. Marketing and analytics tracking (e.g. UTM parameters, click identifiers) capture campaign attribution only — not your health information.

---

### 4. Independence from Meta
**Where:** New section in **Terms & Conditions** + already partially present in the footer disclaimer (consolidate).

> This website is **not part of, affiliated with, or endorsed by Meta Platforms, Inc.** in any way. FACEBOOK™ and INSTAGRAM™ are trademarks of Meta Platforms, Inc.

---

### 5. Footer Compliance Line
**Where:** Always-visible **site footer**, above/with the existing legal links.

> Innohealth provides educational health-coaching services delivered by qualified professionals. Content on this site is not medical advice. Individual results vary.

Plus the existing links: **Privacy Policy · Terms & Conditions · Refund Policy**.

---

## Implementation checklist (when approved)

- [ ] `src/app/terms/page.tsx` — add **Medical Disclaimer**, **Results Disclaimer**, **Independence from Meta** sections.
- [ ] `src/app/privacy/page.tsx` — add **Sensitive Health Data + Advertising** clause.
- [ ] `src/app/page.tsx` — add short **Results Disclaimer** note under the testimonials section.
- [ ] `src/components/layout/Footer.tsx` — add the **footer compliance line** + one-line medical disclaimer.
- [ ] Clean up the remaining `[REVIEW REQUIRED]` placeholder tags in the legal copy and generalize wording.
- [ ] Confirm company legal name, jurisdiction, and support email are final before publishing.

## Out of scope (media-buyer / Ads Manager side — not code)

- Ad copy must not assert/imply the viewer's personal health condition.
- Avoid non-compliant before/after body imagery in ad creatives.
- Ensure the ad account has a verified business and a privacy policy URL set.
- Keep landing-page claims consistent with what the ad promises.

---

*Reviewed against Meta's Advertising Standards: Personal Health & Appearance, Health & Wellness, and Unacceptable Business Practices. Not a substitute for legal review — have final copy approved by a qualified professional.*
