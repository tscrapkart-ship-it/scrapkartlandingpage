# ScrapKart — Main Landing (scrapkart.app)

Brand-led entry page for **`https://scrapkart.app`** that explains what ScrapKart is and routes visitors to either the B2B platform (`b2b.scrapkart.app`) or the B2C site (`b2c.scrapkart.app`).

## Stack

Plain HTML, CSS, and a small vanilla JS file. No build step. No dependencies. Deploys as a static folder.

- **Inter** + **Raleway** + **JetBrains Mono** loaded from Google Fonts CDN
- **Lenis 1.3** smooth scroll loaded from unpkg
- ScrapKart Refined Premium tokens (paper / forest / mint / amber) — light surfaces with deep-forest accents and a signature emerald → forest gradient

## Files

```
.
├── index.html        — single-page everything
├── styles.css        — design tokens + section styles + reveal animations + reduced-motion fallback
├── script.js         — splash, Lenis, scroll progress, IntersectionObserver reveals, stat counter, card spotlight
├── assets/
│   └── logos/        — black + white ScrapKart logos
└── DESIGN.md         — original style reference (monopo-saigon variant) used as inspiration
```

## Run locally

```bash
# from this folder
npx serve . -p 4040
# or
python -m http.server 4040
# then open http://localhost:4040
```

Or just open `index.html` in a browser.

## Deploy

Deploys cleanly as a static folder on Vercel:

```bash
vercel deploy --prod
```

No build command needed. Once deployed, point the `scrapkart.app` apex domain at this Vercel project. The B2B Next.js app should then move to the `b2b.scrapkart.app` subdomain on its own Vercel project.

## Sections

1. Splash (always shows on every page load — fades out at ~1.5s)
2. Sticky nav — logo cross-fades white→black on scroll past the hero, frosted-glass panel materialises
3. Hero — full-bleed forest gradient + drifting orbs, "Trade. Recycle. *Repeat.*"
4. Marquee ticker — black band, white mono text scrolling continuously
5. About — Raleway manifesto + 3 stat cards
6. Display moment — gradient-clipped massive "SCRAPKART."
7. Two Worlds — the routing CTAs (B2B card / B2C card) with cursor-aware spotlight
8. Stats — 3 gradient-clipped counters that animate on scroll-in
9. Closing band — gradient backdrop, "Built in India. *For India.*" with word-by-word reveal
10. Footer

## Editing copy

- **Hero tagline**: `index.html` → `<h1 class="hero-title">`
- **Manifesto**: `index.html` → `<p class="about-manifesto">`
- **Stat numbers**: `index.html` → `data-target` attributes on the three stat values
- **B2B / B2C card text**: `.world-b2b` and `.world-b2c` blocks
- **Footer**: `.footer-grid`

## Notes

- The "Sign in" link has been intentionally omitted from this surface — it's a marketing entry, not the authenticated app. Both Two Worlds CTAs route to the appropriate sub-domain.
- Stat values are placeholders: `₹2.4 Cr+ traded`, `80+ recyclers`, `12 cities active`. Update the `data-target` attributes when the real numbers are ready.
- `prefers-reduced-motion` is respected: orbs stop drifting and reveals materialise instantly, but the splash and marquee still run because they communicate state.
