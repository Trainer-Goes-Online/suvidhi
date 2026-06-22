# Suvidhi — The Postpartum Restore™ · GPT Image 2 Prompt Pack

A ready-to-paste set of prompts for generating every funnel image, on-brand and consistent.

---

## How to use this (read first)

**Recommended flow:** Prime GPT Image 2 **once** with the **Master Context (§0)**, then paste the
prompts **one at a time** in order. Priming once = all 15 images share the same palette, light, and
render style. (Each prompt also restates the key colors, so it still works on its own if you prefer.)

- **In ChatGPT (chat UI):** paste §0 first as its own message, then paste §A1, generate, then §A2, etc.
  The chat remembers the brand context across the whole conversation.
- **Via API / one-shot tools:** the chat won't remember context — paste §0 **above** each prompt.

**Attaching references (GPT Image 2 cannot open links):** screenshot the reference sections and
**upload them with the prompt**. Each prompt says exactly what to attach. Save these 4 first:
- `suvidhi.jpg` — one portrait of Suvidhi. Use the **same one everywhere** for consistency. The
  pink-suit shot (`dsc00467.jpg`) pops best against the burgundy palette; `dsc00257.jpg` /
  `dsc00317.jpg` also fine. ⚠️ If the file opens sideways, **rotate it upright before uploading.**
- `ref-ikore.png` — screenshot of the hero value-stack + product mockup on services.ikorepilates.com
- `ref-tgo.png` — screenshot of the value-stack mockup under the hero on marketing.trainergoesonline.co/recorded
- `ref-candy.png` — screenshot of digitalcandyfactory.com (the "digital candy" product aesthetic)

**Sizes (GPT Image 2 supports 1024×1024, 1536×1024, 1024×1536):**
| Image | Generate at | Then crop to |
|---|---|---|
| Module covers (×5) | 1536×1024 | 16:9 |
| Product mockups (×8) | 1024×1024 | square |
| Value-stack collage | 1536×1024 | 16:7 (wide) |
| Hero collage | 1536×1024 | 4:3 |

**Text caveat:** GPT Image 2 misspells long text. Keep any on-image words to ≤ 4–5 and expect to
re-typeset titles cleanly in Canva/Figma afterward. When in doubt, ask it for **no text** and add it later.

**Two decisions baked in (change if you disagree):**
1. *Suvidhi "in the middle":* I read this as the **collages** centering her portrait with the products
   fanned around her (that's how the ikore/TGO refs work). Individual product mockups stay clean —
   except the *Call with Suvidhi* bonus, which features her naturally. If you'd rather put her face on
   every cover, say so and I'll rewrite §B.
2. *Audit names:* I used the proper artifact names from the course script. Your site's value-stack list
   uses slightly different labels (e.g. "Metabolic Recovery Audit"). Pick one naming set and keep it
   consistent — tell me and I'll align both.

### Direction principles (this is what actually makes the image land)
The v1 Module-1 render came out *opposite* to intent — a glossy, happy woman and a glowing "optimal"
bar that read as *achieved*. Two faults, now fixed in every prompt below:

1. **Don't feed GPT the whole script.** Image models don't reason over long narrative — a 5,000-word md
   dilutes them. Each prompt instead opens with a one-line **CONCEPT:** (the single idea the viewer must
   feel), pre-digested from the script. That's the context it can actually use. (At most, paste that
   one module's 3 on-site bullets — never the full script.)
2. **State the emotion *and* the AVOID.** "Tired-but-hopeful" lost to "premium/aspirational," so now we
   spell out the expression (weary, no makeup, not smiling, not a model) and add an explicit **AVOID:**
   line (no glamorous/happy model, etc.).
3. **Make abstract concepts a literal STATE, not a label.** "A gap between normal and optimal" became
   two decorative bars. Now we say exactly what each element shows — "her marker sits LOW in NORMAL; the
   OPTIMAL target glows far ahead, unreached; the empty space between is the focus."
4. **Slightly longer prompts are fine here** — they trade brevity for precision on purpose. That's the
   difference between on-message and off-message.

---

## §0 — MASTER CONTEXT (paste this once, first)

```
You are designing a cohesive set of marketing images for "Suvidhi — The Postpartum Restore™," a
premium clinical-nutrition program for women in the 0–24 months after childbirth. Audience: educated
Indian mothers, 28–40. Voice: warm, calm, premium, reassuring — real clinical expertise with feminine
softness. Never cold/hospital, never cheesy stock photography.

BRAND PALETTE — use these exact colors:
• Primary rose:           #CB4A5D
• Deep burgundy:          #963543 · #7c2d39 · #5d2129 · #391218 (darkest)
• Soft rose / blush:      #ec9ea9 · #f5c8ce
• Warm gold accent:       #ffb01f · #ffca4a   (sparingly — glow/highlights only)
• Cream background:       #fdfaf8 · #f7f1ee
• Ink / near-black text:  #211e1e

STYLE:
• Modern wellness-meets-clinical, editorial, photoreal, premium soft-3D for products.
• Light backgrounds: soft cream→blush-rose gradient with a faint warm-gold glow.
• Dark/product backgrounds: rich burgundy gradient at ~160° (#391218 → #5d2129 → #963543), soft rose
  light from top-left, faint gold glow bottom-right.
• Soft natural light, gentle shadows, generous negative space, rounded corners (~24px), subtle
  glass/blur. Elegant modern sans-serif (Poppins-like) for any title; keep text minimal and large.
AVOID: blue hospital tones, neon, harsh contrast, clutter, watermarks, gibberish text, stock-photo feel.

I'll send one image request at a time. Keep every image in this exact system so the set feels unified.
Reply with the image only.
```

---

## §A — Module cover images (5)
*Site section: "The Postpartum Restore™ is built on 5 clinical modules." Each card shows a 16:9 visual.
Goal: someone who reads nothing still "gets" the module from the picture. Minimal or no text.*

**Series direction (decided after the v1 test):** all 5 covers star the **same relatable postpartum
mother** — the *customer avatar*, NOT Suvidhi (Suvidhi appears only in the product mockups + collage).
Each cover shows **her doing the right thing and still being stuck** (the module's sticking point), with
the diagnostic object (report / meal / supplements / plan) as a supporting prop. She is real and weary —
no makeup, hair loosely tied, not a glamorous model, not beaming.
➜ **For a consistent woman across all five, attach your finished Module-1 render to Modules 2–5** with the
line: *"Keep the SAME woman and exact style as the attached image."*

### A1 — Module 1 · *What Your Six-Week Checkup Never Checked*
```
CONCEPT (the one idea the viewer must feel): her six-week checkup "cleared" her, but "normal" is not
"recovered" — she is still tired, and there is a visible, UNCLOSED gap between where she is and where
her body needs to be. Hopeful, not happy.

A warm 16:9 editorial scene.
• LEFT: a tented blood-test report card on a cream surface — header "BLOOD TEST REPORT", a few marker
  rows in black ink sitting inside their ranges, a small "CLEARED ✓" stamp. It looks fine on paper.
• RIGHT, slightly behind and softly blurred: a real, relatable Indian mother in her early 30s, visibly
  WEARY — soft tiredness around the eyes, faint under-eye shadows, little to no makeup, hair slightly
  undone, simple loungewear. Quietly hopeful and thoughtful — NOT smiling, NOT glamorous, not a polished
  model. Documentary-editorial realism.
• ACROSS the middle: ONE horizontal recovery gauge. A small marker dot sits LOW, inside a muted grey
  "NORMAL" zone on the left. Far to the right glows a rose-gold "OPTIMAL" target she has NOT reached.
  The empty space between the dot and the glowing target is the focal point — the unclosed gap. Do NOT
  fill the bar to optimal; her level is clearly short of it.
Soft warm window light, cream→blush gradient (#fdfaf8 → #f5c8ce), faint gold glow, gentle shadows.
Mood: honest, tender, hopeful — not cheerful. Keep text to those few labels only.
AVOID: a happy/beaming or glamorous model, full makeup, a maxed-out or fully-filled "optimal" bar, the
marker reaching optimal, cold clinical blue tones, stock-photo gloss.
Size 1536×1024, crop to 16:9.
```
*Attach: `ref-candy.png` (optional, for the digital-product vibe).*

### A2 — Module 2 · *Why Your Body Is Storing Instead Of Rebuilding*
```
CONCEPT: she eats "healthy" — yet by 4 PM she's drained, foggy and crashing, and her body is storing fat
instead of rebuilding. She's doing the right thing; the missing piece is the ORDER she eats in. Relatable.
A warm 16:9 editorial scene. MAIN FRAME: a real, relatable Indian mother in her early 30s at her kitchen
or dining table in the late afternoon, mid energy-crash — head propped on her hand, eyes heavy and foggy,
drained and a little frustrated. In front of her is a "healthy" home meal she's eaten (poha or upma and a
cup of chai) — she did everything right. Honest and weary: no makeup, hair loosely tied, simple
loungewear; NOT glamorous, NOT smiling. SECONDARY, faint in the background: a soft glowing line graph of
blood sugar spiking then crashing, hinting at the cause (keep it off her face). Warm late-afternoon window
light, cream→blush tones (#fdfaf8 → #ec9ea9), faint gold glow, gentle shadows. Mood: "I'm doing
everything right and still crashing." AVOID: a glossy food ad, a happy or energetic model, junk food, a
busy infographic covering her. Size 1536×1024, crop to 16:9.
```

### A3 — Module 3 · *The Missing Nutrients Your Recovery Depends On*
```
CONCEPT: she takes her prenatal/supplements faithfully — yet her hair keeps shedding, because her body
can't absorb or convert them. She's doing the right thing; it still isn't enough. Relatable, a bit worried.
A warm 16:9 editorial scene. MAIN FRAME: a real, relatable Indian mother in her early 30s in a softly lit
bathroom or bedroom, holding her supplement bottle in one hand (she takes it every single day) and looking
down with quiet concern at the hairbrush in her other hand, full of shed hair. Honest and weary: no makeup,
hair loosely tied, simple clothes; NOT glamorous, NOT smiling. Both the bottle and the lost hair are
clearly visible — the contrast is the whole point. SECONDARY, optional and faint: a small dim, broken
chain-link glow near the bottle hinting the nutrients aren't getting through. Warm soft light, cream→blush
tones (#fdfaf8 → #f5c8ce), faint gold glow, gentle shadows. Mood: "I'm taking everything and still losing
my hair." AVOID: a cheerful vitamin advert, a glamorous model, clinical coldness, clutter.
Size 1536×1024, crop to 16:9.
```

### A4 — Module 4 · *Why You Still Don't Feel Like Yourself*
```
CONCEPT: her mood feels flat and "not herself" (a hormone crash, not her personality) — and a calm
morning ritual begins to bring her back. Quiet and restorative, with a flicker of returning calm.
A serene, sunrise-lit bedside scene: soft morning light through a sheer curtain, a glass of water and a
small dish of magnesium tablets on a wooden nightstand. A woman seen softly from behind or in gentle
blur, gazing toward the window — expression quiet and a little distant (muted, not sad), lifted by the
warm light. Warm, restful, restorative. Cream and blush tones with a gentle gold sunrise glow (#ffca4a,
soft). No clutter, minimal/no text. AVOID: a beaming or glamorous model, a bright "everything's perfect"
feel, cold tones. Size 1536×1024, crop to 16:9.
```

### A5 — Module 5 · *The Strategic Clarity Call*
```
CONCEPT: knowing the science is only 20% — the other 80% is how HER body responds. This is the moment she
stops guessing and chooses her own data-driven plan. Resolved, quietly hopeful, in control — the one cover
where a soft, genuine smile is right.
A warm 16:9 editorial scene. MAIN FRAME: a real, relatable Indian mother in her early 30s at a tidy desk,
looking down with calm resolve at her own PERSONALIZED plan — a printed scorecard/protocol with rose
charts and hand-written notes ("My plan. My pace. My body.") — her phone beside it showing a "Call booked"
confirmation. Her expression is settled and quietly hopeful: the relief of finally having a clear next
step. Natural and honest, minimal makeup, simple clothes; a small real smile is okay, NOT glamorous.
Warm soft light, cream→blush tones, faint gold glow, gentle shadows. Mood: "this one is mine."
AVOID: a corporate/stocky look, a glamorous model, a cold office, clutter. Size 1536×1024, crop to 16:9.
```
*Alternative (your v1 result was excellent): the desk flat-lay **without** her — the "My plan. My pace.
My body." scorecard + "Call booked" phone — also nails this module. Pick whichever fits the series better.*

---

## §B — Product mockups (8)
*The whole point here is **consistency** — all 8 must feel like one premium boxed family (like Deepali's
set). The lever is a shared **Product Design System**: paste it once, then send B1–B8.*

### Paste this ONCE, before B1 — PRODUCT DESIGN SYSTEM
```
PRODUCT DESIGN SYSTEM — one cohesive premium family (a boxed set). Every mockup shares ALL of this:
• BACKGROUND: soft cream→blush gradient (#fdfaf8 → #f5c8ce), a faint warm-gold glow, ONE soft natural
  drop-shadow under the product. Product centered and floating, even margin around it (easy to cut out).
• PRINTED PIECES (book, audit booklets, tracker cards): deep-burgundy cover (#5d2129 / #391218) with a
  thin gold-foil keyline border and a gold-foil title. Each carries the SAME crest — minimal gold
  line-art of a mother cradling her baby inside a small laurel — and the small line "A DIGITAL CANDY BY
  SUVIDHI" at the base. Consistent elegant typography across all pieces.
• SCREENS (tablet / phone / laptop): warm rose-and-cream app UI (#CB4A5D accents on cream), rounded
  cards, calm and premium — never techy or blue.
• A small gold-foil label says which piece it is: "ASSESSMENT", "AUDIT 01"–"AUDIT 04", or "BONUS".
• PEOPLE: NO photographic woman as the centerpiece. The mother-baby line-art crest is the feminine
  through-line on every cover. Suvidhi's real photo appears ONLY on the assessment screen and the 1:1
  call-bonus screen.
• THE PRODUCT IS A 25-MINUTE ON-DEMAND MINI-COURSE ("a digital candy") — 5 short modules / 9 lessons,
  none longer than ~4 minutes. NEVER depict it as a live class, a multi-week program, or 45-min videos.
Render 1024×1024, premium soft-3D. Keep on-art text short (titles + labels only); re-typeset later.
```
*Attach `ref-ikore.png` to every B-prompt for the mockup finish; attach `suvidhi.jpg` only on B1 + B6.*

### B1 — ASSESSMENT (flagship) · *The Postpartum Restore™ 25-Minute Guided Assessment*
```
LABEL: ASSESSMENT. A premium duo, side by side:
• A modern tablet, upright, showing a warm ON-DEMAND course screen — Suvidhi (from the attached photo,
  faithful likeness) teaching in a small video tile; title "The Postpartum Restore · 25-min Guided
  Assessment"; a short lesson list where each lesson is only a couple of minutes ("Module 1 · The
  Depletion Reality — 2:30", "Module 2 · Metabolic Recovery — 2:30", "Module 3 · Micronutrient Synergy
  — 2:30"); a slim progress ring. NOT live, NO 45-minute timer, NOT a multi-week plan.
• Beside it, a deep-burgundy hardcover companion guide: gold-foil title "THE POSTPARTUM RESTORE", the
  mother-baby crest, and small lines "The missing manual the hospital never gave you" and
  "5 modules · 9 short lessons · 25 minutes".
Apply the PRODUCT DESIGN SYSTEM. Size 1024×1024.
```
*Attach: `suvidhi.jpg` (upright), `ref-ikore.png`.*

> The four audits are a matching SET — same burgundy+gold booklet, same crest, differing only by title +
> a tiny icon + the "AUDIT 0X" label. For maximum consistency, **attach your finished B2 render to B3–B5**
> with *"match this exact booklet style; only change the title, icon and number."*

### B2 — AUDIT 01 · *The Postpartum Depletion Audit*
```
LABEL: AUDIT 01. A single premium burgundy+gold audit booklet, upright. Gold-foil cover title "THE
POSTPARTUM DEPLETION AUDIT", a tiny blood-drop + checklist line-icon, the mother-baby crest, "A DIGITAL
CANDY BY SUVIDHI". One cream worksheet page peeks out showing faint blood-marker rows with checkboxes.
One of a matching SET OF FOUR audits. Apply the PRODUCT DESIGN SYSTEM. Size 1024×1024.
```
*Attach: `ref-ikore.png`.*

### B3 — AUDIT 02 · *The Amino Acid Primer Protocol*
```
LABEL: AUDIT 02. A matching burgundy+gold booklet (same set as AUDIT 01). Gold-foil title "THE AMINO
ACID PRIMER PROTOCOL", a tiny plate/leaf line-icon, the crest, "A DIGITAL CANDY BY SUVIDHI". A small
cream "7-DAY TRACKER" card peeks out with a faint week grid. Apply the PRODUCT DESIGN SYSTEM. Size 1024×1024.
```
*Attach: `ref-ikore.png` + your B2 render.*

### B4 — AUDIT 03 · *The Clinical Supplement Audit & Bioavailability Guide*
```
LABEL: AUDIT 03. A matching burgundy+gold booklet (same set). Gold-foil title "THE CLINICAL SUPPLEMENT
AUDIT", a tiny capsule/bottle line-icon, the crest, "A DIGITAL CANDY BY SUVIDHI". A small supplement
bottle rests beside it for context. Apply the PRODUCT DESIGN SYSTEM. Size 1024×1024.
```
*Attach: `ref-ikore.png` + your B2 render.*

### B5 — AUDIT 04 · *The Low-Toxin Home Audit & 14-Day Circadian Reset Tracker*
```
LABEL: AUDIT 04. A matching burgundy+gold booklet (same set). Gold-foil title "THE LOW-TOXIN HOME
AUDIT", a tiny home/leaf line-icon, the crest, "A DIGITAL CANDY BY SUVIDHI". Beside it a cream "14-DAY
RESET TRACKER" card with a small calendar grid and sunrise icons. Apply the PRODUCT DESIGN SYSTEM.
Size 1024×1024.
```
*Attach: `ref-ikore.png` + your B2 render.*

### B6 — BONUS · *30-Minute Strategic Clarity Call with Suvidhi*  ← features Suvidhi
```
LABEL: BONUS. A modern phone, upright, showing a warm 1:1 video call — Suvidhi (from the attached photo,
faithful likeness) on screen in the rose-and-cream UI, header "30-min Strategic Clarity Call", a soft
"Join call" button. A small gold-foil "BONUS" tab in the corner. Apply the PRODUCT DESIGN SYSTEM.
Size 1024×1024.
```
*Attach: `suvidhi.jpg` (upright), `ref-ikore.png`.*

### B7 — BONUS · *Private Postpartum Mothers Community*
```
LABEL: BONUS. A modern phone, upright, showing a warm community feed in the rose-and-cream UI — rounded
post cards, small circular LINE-ART member avatars (not real photos), header "Postpartum Mothers
Community", a welcoming layout. A small gold-foil "BONUS" tab. Apply the PRODUCT DESIGN SYSTEM.
Size 1024×1024.
```
*Attach: `ref-ikore.png`.*

### B8 — BONUS · *Monthly Group Coaching Sessions*
```
LABEL: BONUS. A modern laptop showing a warm group coaching call in the rose-and-cream UI — a tidy grid
of friendly LINE-ART / illustrated video tiles (not real faces), header "Monthly Group Coaching", a
small calendar chip. A small gold-foil "BONUS" tab. Apply the PRODUCT DESIGN SYSTEM. Size 1024×1024.
```
*Attach: `ref-ikore.png`.*

---

## §C — Collages (2)
**Do these LAST, after B1–B8 exist.** The collages must reuse the *exact* products from §B, so the hero
and value-stack match the individual mockups. ➜ **Attach your finished B1–B8 renders to the collage
prompts** and say *"arrange these exact products."* That guarantees consistency far better than
re-describing them.

> ⚠️ A free-generated family collage WILL rename/redraw your products (a test render relabelled the
> audits "Nutrition / Energy / Hormone / Lifestyle"). So both prompts say **keep every title exactly**.
> If GPT still drifts, composite the cut-out B-render PNGs in Canva and use GPT only for background/light.

### C1 — Value-stack collage · section *"₹21,000 of clinical value, yours today for ₹497"*
*The site already itemises prices in HTML, so the image is **visual only** — NO prices, NO people. Goal:
3 clear zones (hero centre, audits one side, bonuses the other), 16:7.*
```
LABEL: VALUE-STACK COLLAGE — products only, NO people. THREE clear zones, hero in the middle.
Use ONLY the products in the attached mockups — do NOT invent extras (no habit-tracker cards, no boxes)
and do NOT drop any. Keep every title exactly; do not rename or redraw.
LAYOUT (left → right), everything on one cream surface with even depth:
• CENTRE — the hero, biggest and slightly forward: a tablet standing upright showing "The Postpartum
  Restore · 25-min Guided Assessment", with the burgundy "THE POSTPARTUM RESTORE" hardcover just behind
  it. This is the crux of the value.
• LEFT GROUP: the four audit booklets — AUDIT 01 "Depletion", AUDIT 02 "Amino Acid Primer", AUDIT 03
  "Clinical Supplement", AUDIT 04 "Low-Toxin Home" — standing in a neat, slightly overlapping fan.
• RIGHT GROUP: the three bonuses grouped cleanly — the "1:1 Call with Suvidhi" phone, the "Postpartum
  Mothers Community" phone, and the "Monthly Group Coaching" laptop.
Premium and uncluttered: clear gaps between the three zones, lots of cream negative space, nothing
touching the edges. Cohesive burgundy + gold + rose on a soft cream→blush gradient (#fdfaf8 → #f5c8ce),
faint warm-gold glow, soft grounded reflections. No people, no prices, no text. Keep it all in the
central horizontal band (empty cream above + below) for a clean 16:7 crop. Generate 1536×1024.
```
*Attach: your **B1–B8 renders** + `ref-ikore.png`. NOT Suvidhi.*
*If GPT drops or invents items: "Show exactly these and nothing else: the Postpartum Restore tablet+book
in the centre, the 4 audit books on the left, the 3 bonus screens on the right."*

### C2 — Hero collage · top of the landing page (site ratio 4:3)
*One image: Suvidhi (creator) on the left + the full product family on the right. ~95% real face is fine.
RELIABILITY TRICK: do C1 first, then attach the finished C1 image as the product reference here — GPT
then only has to place 2 things (her + that product group), so it stops dropping/inventing items.*
```
LABEL: HERO COLLAGE — Suvidhi (creator) + the full product family. One image, 4:3.

SUVIDHI (left side): from the attached portrait — match her face, curly hair, skin tone, mehndi hands and
fuchsia-pink suit closely; do NOT beautify, slim, lighten or AI-stylise her. Keep her real pose: seated
in her cream armchair, hands gently clasped, with a soft warm SMALL GRIN like in the photo — approachable
yet AUTHORITATIVE, the expert who created this. She must look naturally part of the scene with real
lighting and a soft grounded shadow — NOT a flat pasted cut-out.

PRODUCTS (right side, a clean cluster with depth — use ONLY these, do NOT drop or invent any, no
habit-tracker cards): front centre the burgundy "THE POSTPARTUM RESTORE" hardcover + the tablet (25-min
course); the four audit booklets (AUDIT 01–04, titles kept exactly) standing behind; the three bonus
screens (1:1 Call phone, Community phone, Coaching laptop) grouped in front-right.

Generous spacing, premium, uncluttered. Soft cream→blush gradient (#fdfaf8 → #f5c8ce), faint gold glow,
soft shadows, cohesive with the burgundy + gold products. Clear breathing room between her and the
products. Minimal / no text. Generate 1536×1024, crop to 4:3.
```
*Attach: Suvidhi's **real seated photo** (the fuchsia-suit, small-grin one — face reference) + **the
finished C1 render** (product group) + `ref-ikore.png`. (If you skip C1, attach B1 + all 4 audits + 3
bonuses instead.)*
*Nudges if needed: "Keep her face exactly like the attached photo, with her small grin." / "Include all
4 audits and all 3 bonuses — don't drop any, don't add anything else."*

---

## Workflow summary
1. Save the 4 reference files (`suvidhi.jpg`, `ref-ikore.png`, `ref-tgo.png`, `ref-candy.png`).
2. Paste **§0 Master Context** once.
3. Generate **§A1 → §A5** (module covers), then **§B1 → §B8** (mockups), then **§C1, §C2** (collages),
   attaching what each prompt lists.
4. If a render drifts off-brand, reply: *"Keep the exact same style and palette, but [one change]."*
5. Re-typeset any titles cleanly in Canva/Figma; drop the finished images into the `Placeholder`
   slots in the site (module visuals 16:9, value-stack collage 16:7, hero 4:3).
