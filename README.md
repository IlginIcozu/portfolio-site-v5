# Ilgın İçözü — Portfolio Website

Static multi-page portfolio built for GitHub Pages. Dark, WebGL-driven "light through haze"
design with GSAP-powered micro-animations, smooth scrolling, page transitions, and a custom cursor.

## Stack

All libraries load from CDNs — no build step, deploys as plain static files.

- **GSAP 3 + ScrollTrigger** — entrance choreography, scroll reveals, parallax, page-transition veil
- **Lenis** — smooth scrolling (integrated with ScrollTrigger)
- **Three.js** — fullscreen background shader (`js/gl.js`): domain-warped fog with a glowing
  contour band, mouse-reactive, dims on scroll
- **Fonts** — Space Grotesk (display), Inter (body), IBM Plex Mono (labels)

## Design system

Terminal / "signal-chain" chrome inspired by dotsimulate.com and alptugan.com, layered
over the original dark-red identity: a fixed bottom HUD (oscilloscope + scroll % + local
time), bracketed `[ 01 / … ]` labels, per-page background tints (`body[data-page]`),
corner-ticked media frames, decode-on-hover text scramble (`data-scramble`), and the MOPs
module rack with animated per-module canvas visualizations.

**"Every line is a live signal"** — the sitewide interaction system (`js/app.js`):

- **Home** (`initSignalMenu`): the menu is one playable string spanning the viewport.
  It idles with a slow wave, leans into the cursor, and can be grabbed and plucked
  (real 1-D wave physics). Pages are typographic cue points riding the string —
  hovering one tints its stretch of the line. Touch/small/reduced-motion falls back
  to a static directory list (`.patch--static`).
- **All pages** (`initHud`): the HUD carries the signal rail — the same string
  miniaturized, with a cue tick per page (current lit), scroll position as a red
  playhead, hover ripple, and click-to-navigate.
- **All subpages** (`initRuleStrings`): the divider line under each page title is a
  live string that ripples in the page's tint.

**Work covers**: on the three project pages (sound / visual / code) every titled work
renders as a full-bleed banner — autoplaying muted video (Vimeo background mode /
YouTube) or the first gallery image — with the title overlaid. Clicking it slides the
full work (interactive player, description, info, credits) open underneath; the detail
player only loads on first open (`renderCoverMedia` / `initWorkToggles` in `js/app.js`).

## Files

- `index.html` — the signal: string-menu landing (single viewport, no scroll)
- `sound.html` — section 01, New Media Sound Design & Music (project list)
- `immersive-experience.html` (Visual Content Creation) / `creative-coding.html` /
  `mops.html` (MOPs — Modular Operators, TouchDesigner toolkit) /
  `released-music.html` / `about-contact.html`
- `styles.css` — design system (tokens at the top of the file)
- `js/data.js` — **all portfolio content** (projects, galleries, releases)
- `js/app.js` — rendering + interactions (preloader, cursor, reveals, galleries, transitions)
- `js/gl.js` — Three.js background shader
- `assets/placeholders/` — gallery images
- `xyz-bg/` — the standalone ilginicozu.xyz audiovisual sketch (kept as-is, linked from the hero)

## Edit your project entries

Open `js/data.js`. All content is in the `window.SITE_DATA` object:

- `immersiveSound`, `immersiveExperience`, `creativeCoding` — project cards
- `creativeCodingExtraGallery` — the big archive slider
- `releases` — Bandcamp discography

### Media types per project

```js
media: { type: "vimeo", id: "123456789", title: "My piece" }
media: { type: "iframe-src", src: "https://…", title: "…", interactive: true }
media: { type: "gallery", imageFit: "contain", backgroundColor: "#111",
         slides: [{ src: "assets/…", alt: "…" }] }
```

`contained: true` narrows wide media; `frameClass: "media-square"` makes it 1:1.

## Accessibility & performance notes

- `prefers-reduced-motion` disables the preloader, smooth scroll, shader loop, and reveals
- Custom cursor only activates on fine-pointer (mouse) devices
- The shader pauses when the tab is hidden; pixel ratio is capped
- All iframes are `loading="lazy"`

## Publish on GitHub Pages

1. Upload all files in this folder to your GitHub repository.
2. Repository settings → **Pages**.
3. Set the source to your main branch and the root folder. Save.
