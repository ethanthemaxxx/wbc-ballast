# Ballast — concept site

A static concept site for **Ballast**, a fictional autonomous on-call engineer for SRE and platform teams. It reproduces the structure, grid, proportions, type scale, motion and interaction patterns of the reference site (antimetal.com) with a fully new identity: name, logo, colours, fonts, copy, images and code are all new. Copy comes verbatim from `COPY.md`.

Concept project by Wolfgang Betancourth — [wolfbc.art](https://wolfbc.art).

## Pages

| Path | Page |
|---|---|
| `index.html` | Home |
| `careers/index.html` | Careers |
| `log/index.html` | Investigation log (blog index, with archive filter and search) |
| `log/the-three-am-page/index.html` | Article: "The three a.m. page" |
| `demo/index.html` | Book a demo (local form with validation, loading, error and success states) |
| `404.html` | Not found (uses root paths, as GitHub Pages serves it from any depth) |


No build step. Everything uses relative paths and works at the root of a GitHub Pages subdomain.

## Files

- `css/site.css` — one stylesheet; tokens first (`:root`), then components and pages.
- `js/site.js` — all behaviour, no libraries.
- `assets/` — the images from the project's `assets/` folder, copied unchanged.
- `favicon.svg` — own mark.

## Fonts (Google Fonts, `display=swap`)

- **Petrona** 400 (+ italic) — headlines, footer links, log titles.
- **Albert Sans** 400/500/600 — text and UI.
- **IBM Plex Mono** 400/500 — service names, logs, diffs, figures in the product UI.

## Libraries

None. GSAP 3.13 was allowed but not needed: the motion is CSS plus a small script. The deep-water field is canvas 2D.

## What reproduces the reference

- Grid: 1080 px container with fluid 12–40 px gutters; 416 | 652 alternating feature rows with a 12 px gap; tiles of 3 × 352 and 2 × 534; 760 | 288 testimonial cards; 445 | 623 agent list and detail; full-bleed five-fifths footer with dashed separators; full-bleed drifting log carousel (280 px cards, 288 px pitch).
- Rhythm: 80 / 64 / 48 px section padding at desktop / tablet / phone; 48 px heading-to-content, 24 px H1-to-subtitle, 40 px to the button, 80 px to the product film, 64 px to the logo strip.
- Type scale: the reference's `clamp()` steps with linked line-height and tracking (H1 54 px, H2 39.6 px, small H2 28.8 px, body 18 px at 1440).
- Section order: hero with product film → dark four-step capabilities → testimonial with figure → agent library with 6-second auto-advance → three tiles → two ways of working → second testimonial → video testimonial → dark final CTA with horizon → log carousel → footer.
- Behaviour: sticky 88 px header with glass pills whose logo collapses to the mark on scroll; mobile menu button with a dropdown panel below 1024 px; dark zones that fade in over 0.5 s as they cross the middle of the screen; the product film designed at 1280 px and scaled to fit; counters; auto-advancing tabs with progress bars; drifting carousels; cursor halo over the product windows; one-time load intro.

## What is original (and the transformed signatures)

- **Headline reveal**: the reference builds headlines from dots that sweep across. Here the water rises: thin horizontal level lines fill the headline from the bottom up, then thicken into the letters (about 1.2 s), in brass, settling to ink.
- **Material windows**: the reference's copper/mauve WebGL fabric is replaced by **deep water** — one shared canvas 2D field built from `field-caustics.webp` drifting in two layers, seen through every window panel, with a brass glow and a level-line halo that follow the cursor. If the canvas is not drawn (or motion is reduced) the static image shows instead.
- **Product film**: a new 12-second loop (alert → evidence → diff → staging check → postmortem) with invented data. Under the scenes a fixed timeline band (five marks of the night and a p99 latency line drawn in level lines) fills in as the incident moves. A visible Pause/Play button sits under the film; the status pill opens a stage menu and the scene marks open a short stage note (both hold the film on that scene, and below 900 px they leave the tab order).
- **Load intro**: a short "dawn" in navy and brass ("Taking the watch"), once per session.
- The windows tint the same water per group: deep (capabilities), slate (rules), first light (ways to work, careers hero).
- Logo, agent icons (a circle filled with level lines, one level per agent), the "%" glyphs and the charts are all drawn from the same horizontal-line primitive.
- Palette: cool paper `#f2f3ef`, navy ink `#0d1b2a`, brass `#a8834a`, verification green `#2f8f6b`, incident red `#d64545`, night `#0a1520`.

## Assets replaced with CSS/SVG

- Customer logos: typeset wordmarks (one with a small SVG mark), no images.
- Testimonial avatars: initials in Petrona on a brass-tinted disc (no portraits were supplied).
- Agent icons, charts, before/after bars, the "%" glyph, the logo and the favicon: inline SVG.
- Log pictures: the three photographs share one navy-to-brass SVG duotone (`#duo`), shown as shot on hover. Covers for the entries without a picture (4–6 on /log/, the third related card) are CSS level-line covers, so no photo repeats on a page.
- `assets/og.jpg` (1200×630, cut from `horizon-dawn.webp`) for sharing; `assets/log/l-0N-600.webp` are 600 px versions served through `srcset` to the cards.
- Product UI everywhere is HTML/CSS, not images.
- The reference's careers video has no counterpart (no footage supplied); the careers hero uses `field-caustics.webp`.

## Accessibility

One `h1` per page, skip link, 44 px tap targets (footer links, text links, tabs, filters, search), visible focus rings in brass, `aria-expanded` on the menu, the film menu and the scene marks, labelled form fields with per-field errors and a live summary, pause buttons on the product film, the agent tabs and the log carousel (tabs and carousel also pause on hover and focus); the agent detail announces only a visitor's own choice, never the auto-advance. With `prefers-reduced-motion` everything is visible and still: no intro, no reveal, the film rests on its final scene, carousels and tabs stay put, the water field shows its still image. No horizontal scroll at 320 px.
