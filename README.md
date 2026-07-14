# Handoff: The Meditation Community — Marketing Landing Page

## Overview
A single-page marketing site for **The Meditation Community** (themeditationcommunity, hosted on Skool) — a meditation community founded in 2025 by Dr Ian Gawler OAM and Daniel Traini, teaching Mindfulness-based Stillness Meditation (MbSM). The page drives sign-ups to the free Skool community and the paid "Next Steps" membership.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, not production code to copy directly. The task is to **recreate this design in the target codebase's environment** using its established patterns — or, if no environment exists yet, deploy it as a static site (it is deliberately framework-free: one HTML file + one CSS file + one JS file). **Netlify static hosting is the intended target** because the two forms use Netlify Forms.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy and interactions are final. Recreate pixel-perfectly.

## Files
- `The Meditation Community.html` — full page markup (all sections, inline data attributes)
- `styles.css` — all styling, design tokens as CSS custom properties in `:root`
- `app.js` — scroll reveal, parallax clouds, counters, breathing exercise, teacher bio modal, FAQ accordion, magnetic buttons, sticky mobile CTA, **Netlify AJAX form handler** (bottom of file)
- `assets/` — logo marks (`icon-blue.png`, `icon-white.png`), teacher portraits under `assets/teachers/`

## Page Sections (top to bottom)
1. **Nav** — sticky; brand + anchor links (How it works, What's inside, Teachers, Pricing, FAQ) + single CTA "Join free" → https://www.skool.com/themeditationcommunity/about. **No login link.**
2. **Hero** — headline "Find your calm. Keep it for life.", parallax clouds, breathing orb (large readable state label, e.g. "Hold"), teacher avatar proof strip ("Hundreds of members learning together"), CTAs: Join free (Skool) + "Try a 1 minute breath" (scrolls to breathe section). No fine-print note under the CTAs (credit-card/cancel-anytime line was removed — keep it removed).
3. **Stats** — "Hundreds" (static label, not a count-up number) / 10 teachers / Free to begin / teaching since 1981.
4. **How it works** — 3 steps: Learn, Practice, Grow.
5. **What's inside** — feature bento grid (live sessions, recordings, Healing Circle, self-paced MbSM courses). Two screenshot placeholders (`.ph`) need real product screenshots.
6. **Breathe** — interactive box/4-7-8/5-5 breathing exercise with timer (see app.js).
7. **About us** (`#about`) — story copy (Gawler lineage since 1981, founded 2025, no "therapeutic" qualifier — see decisions below) + founder portrait cards: Ian Gawler (Founder), Daniel Traini (Co-founder), equal size/alignment.
8. **Teachers** (`#teachers`) — 10 portrait cards in this exact order: Ian, Daniel, Peta, Marie, Melissa, Lisa, Mel, Saurabh, Lell, Brigitte. Click opens bio modal (bios embedded in `.t-bio-data`). Ends with **Become a teacher** card (`#become-a-teacher`) containing a Netlify form — intro copy is contraction-free ("If you would love to... we would love to... we will be in touch").
9. **Testimonials** — 4 REAL member quotes (Wendy/Australia, Anne/Malaysia, Amy/Australia cards; Amanda/Australia feature quote). Initial-letter avatars, no star ratings. Do not replace with fabricated reviews.
10. **Pricing** — Begin Free vs Next Steps Membership; both CTA to Skool. No hard prices on cards ("Current pricing shown on Skool"). Guarantee line under the plans reads only "Start gently and deepen when it feels right" — no "no card required" / "cancel anytime" copy.
11. **FAQ** (`#faq`) — accordion; lead text links "Send us a message" → `#contact`. No separate support box on this section — the contact form is the single support path.
12. **Contact** (`#contact`) — copy ("...send us a note and we will reply personally") + Netlify contact form; email fallback daniel@themeditationcommunity.org.
13. **Final CTA** — headline breaks across two lines ("Your calmer life" / "starts with one breath…"), body copy breaks before "Free to begin" onto its own line. **Footer** (anchor links only; no Careers/Help Center; "Practice" column lists the 5 MbSM components, see below), **sticky mobile CTA**, **teacher bio modal**.

## Recent content decisions (keep as-is)
- **Member counts are qualitative, not numeric.** Hero proof strip, stats bar and final-CTA copy all say "hundreds of members"/"Hundreds" — do not reintroduce a specific number (e.g. "266"); it dates fast and wasn't accurate. (Open question for client: they may want a different phrasing than "hundreds of" — flagged but not yet changed.)
- **No contractions/abbreviations in body copy.** Client explicitly asked for zero abbreviations site-wide (e.g. "1-min" → "1 minute") and zero contractions in the teacher/contact copy ("we'd" → "we would", "we'll" → "we will"). Keep new copy consistent with this — spell things out.
- **Founder cards are equal-height/aligned.** `.founder-cards` is a plain 2-col grid — do not add per-card offset margins (an earlier `.founder:last-child { margin-top }` rule caused Ian/Daniel misalignment and has been removed; keep both cards visually level).
- **Footer "Practice" column** lists the 5 MbSM components (Deep Relaxation, Mindfulness, Meditation, Imagery, Contemplation) — these are not standalone pages yet, so all 5 currently link out to the Skool join CTA (`https://www.skool.com/themeditationcommunity/about`). Swap in real in-page anchors only if/when those sections exist; until then keep them pointed at the join CTA rather than dead `#` links.
- **Hero subheadline is final** — client (Ian & Daniel) liked the original wording; don't rewrite for "illness/healing" framing even though several testimonials are illness-journey stories. If more emotional alignment with that audience is wanted later, treat it as a separate proposal, not a default change.
- **Pricing guarantee line and hero note were intentionally trimmed** — client removed "no credit card required" and "cancel anytime" copy in two places (hero note, pricing guarantee). Don't re-add either phrase.
- **Wendy's testimonial** reads "...a wonderful safe supportive place of learning." — the word "healing" was deliberately removed from the original quote; don't restore it.

## Netlify Forms (important)
Two forms, both `name` + hidden `form-name` input + honeypot `bot-field`:
- `contact` — fields: name, email, message
- `become-a-teacher` — fields: name, email, message
`app.js` intercepts submit and POSTs urlencoded to `/`, then shows the inline `.form-success` message. This only delivers submissions when deployed on Netlify with form detection enabled. Keep the hidden `form-name` inputs — required for AJAX submissions.

## Design Tokens (from styles.css `:root`)
- Fonts: **Plus Jakarta Sans** (400–800) for UI, **Newsreader italic** for serif accents (Google Fonts).
- Palette: blue family (`--blue`, `--blue-deep` ≈ #0a6bc0, `--blue-bright`, `--blue-ink`), pale sky backgrounds (`--sky-pale`), warm ink neutrals (`--ink`, `--ink-faint`), lines `--line`. Exact values in `:root`.
- Radii: `--r-lg` (~20px), `--r-xl` (~28px), `--r-pill`; shadows `--shadow-sm/md`.
- Section rhythm: `.section` uses `clamp` padding; content width via `.wrap`.

## Interactions & Behavior
- Scroll-reveal: `.reveal` + delay classes `d1–d4` (IntersectionObserver).
- Parallax cloud SVGs via `data-speed`.
- Count-up numbers via `data-count`.
- Magnetic hover on `[data-magnetic]` buttons.
- Breathing exercise: three patterns, animated orb scale + progress ring + 60s timer.
- Teacher modal: prev/next navigation, Esc/overlay close.
- FAQ accordion: single-open behavior.
- Responsive: nav links hide <920px; grids collapse to 2/1 columns <880/600px; sticky bottom CTA appears on mobile.

## Assets
- Teacher portraits supplied by client (in `assets/teachers/`), logo marks from client PDF renders.
- `.ph` placeholders in "What's inside" await real Skool screenshots.
- Original client source docs (bios, FAQ draft, reviews) live in the project `uploads/` folder — reviews in `website-reviews.docx` are the canonical testimonial text.
