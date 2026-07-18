/* ─────────────────────────────────────────────────────────────────────────
   APP — rendering + interaction layer
   Requires: js/data.js (content). Enhances with GSAP / ScrollTrigger / Lenis
   when available; every feature degrades gracefully without them.
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const html = document.documentElement;
  const DATA = window.SITE_DATA || {};
  const hasGsap = typeof window.gsap !== "undefined";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const ANIM = hasGsap && !reducedMotion;

  if (hasGsap) {
    gsap.config({ force3D: true });
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
    }
  }

  /* ── helpers ──────────────────────────────────────────────────────────── */

  const pad2 = (n) => String(n).padStart(2, "0");

  function escapeHtml(text = "") {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Split an element's text into per-character spans (each word wrapped in an
  // overflow-hidden span so characters can slide up from behind a mask).
  function splitChars(el) {
    if (el.dataset.splitDone) return el.querySelectorAll(".split-char");
    const text = el.textContent;
    el.setAttribute("aria-label", text.trim());
    el.textContent = "";
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(" "));
        return;
      }
      const word = document.createElement("span");
      word.className = "split-word";
      word.setAttribute("aria-hidden", "true");
      Array.from(part).forEach((ch) => {
        const c = document.createElement("span");
        c.className = "split-char";
        c.textContent = ch;
        word.appendChild(c);
      });
      frag.appendChild(word);
    });
    el.appendChild(frag);
    el.dataset.splitDone = "1";
    return el.querySelectorAll(".split-char");
  }

  /* ── content rendering ────────────────────────────────────────────────── */

  // opts.defer: markup lives inside a collapsed work-detail — iframes get
  // data-src (loaded on first open) and scroll-driven attrs are dropped.
  function renderMedia(media, title, opts = {}) {
    if (!media) return "";
    const defer = !!opts.defer;
    const reveal = defer ? "" : " data-media-reveal";
    const wrapCls = ["media"];
    if (media.contained) wrapCls.push("media-contained");
    if (media.mediaClass) wrapCls.push(media.mediaClass);
    const frameCls = ["media-frame"];
    if (media.frameClass) frameCls.push(media.frameClass);

    // Videos run full-bleed; interactive/contained embeds, galleries and
    // in-detail media (which sits in an overflow-clipped panel) don't.
    const isVideo = media.type === "vimeo" || (media.type === "iframe-src" && !media.interactive);
    if (isVideo && !media.contained && !defer) wrapCls.push("media-bleed");

    if (media.type === "vimeo" || media.type === "iframe-src") {
      const src =
        media.type === "vimeo"
          ? `https://player.vimeo.com/video/${media.id}?title=0&byline=0&portrait=0`
          : media.src;
      return `
        <div class="${wrapCls.join(" ")}">
          <div class="${frameCls.join(" ")}"${reveal}>
            <iframe
              ${defer ? `data-src="${src}"` : `src="${src}"`}
              title="${escapeHtml(media.title || title)}"
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
          ${media.interactive ? `<p class="media-hint mono">[ Interactive — click / scroll inside ]</p>` : ""}
        </div>
      `;
    }

    if (media.type === "gallery") {
      const fit = media.imageFit === "contain" ? "contain" : "cover";
      const bg = media.backgroundColor || "#0d0d0f";
      return `
        <div class="${wrapCls.join(" ")}" data-gallery>
          <div class="${frameCls.join(" ")} gallery"${reveal} data-cursor-label="Drag" style="background:${bg}">
            <div class="gallery-track" data-gallery-track>
              ${media.slides
                .map((slide) =>
                  slide.video
                    ? `
                    <figure class="gallery-slide">
                      <video ${defer ? `data-src="${slide.video}"` : `src="${slide.video}" autoplay`} muted loop playsinline preload="metadata" draggable="false" style="object-fit:${fit}" aria-label="${escapeHtml(slide.alt || title)}"></video>
                    </figure>
                  `
                    : `
                    <figure class="gallery-slide">
                      <img src="${slide.src}" alt="${escapeHtml(slide.alt || title)}" loading="lazy" decoding="async" draggable="false" style="object-fit:${fit}" />
                    </figure>
                  `
                )
                .join("")}
            </div>
          </div>
          <div class="gallery-ui mono">
            <span class="gallery-count" data-gallery-count>01 / ${pad2(media.slides.length)}</span>
            <div class="gallery-nav">
              <button class="gallery-btn" type="button" data-gallery-prev aria-label="Previous slide">←</button>
              <button class="gallery-btn" type="button" data-gallery-next aria-label="Next slide">→</button>
            </div>
          </div>
        </div>
      `;
    }

    // self-hosted video with sound: a real player (controls), poster frame
    // shows until the user presses play; deferred until the work is opened
    if (media.type === "video") {
      return `
        <div class="${wrapCls.join(" ")}">
          <div class="${frameCls.join(" ")}"${reveal}>
            <video ${defer ? `data-src="${media.src}"` : `src="${media.src}"`} controls playsinline preload="metadata"${media.poster ? ` poster="${media.poster}"` : ""}></video>
          </div>
        </div>
      `;
    }

    if (media.type === "grid") {
      return `
        <div class="${wrapCls.join(" ")} media-grid"${reveal ? ' data-reveal=""' : ""}>
          <div class="media-grid-inner">
            ${media.slides
              .map((slide) =>
                slide.video
                  ? `<figure class="grid-cell"><video ${defer ? `data-src="${slide.video}"` : `src="${slide.video}" autoplay`} muted loop playsinline preload="metadata" draggable="false" aria-label="${escapeHtml(slide.alt || title)}"></video></figure>`
                  : `<figure class="grid-cell"><img src="${slide.src}" alt="${escapeHtml(slide.alt || title)}" loading="lazy" decoding="async" draggable="false" /></figure>`
              )
              .join("")}
          </div>
        </div>
      `;
    }

    return `
      <div class="${wrapCls.join(" ")}">
        <div class="${frameCls.join(" ")}"${reveal}>
          <img src="${media.src}" alt="${escapeHtml(media.alt || title)}" loading="lazy" decoding="async"${defer ? "" : " data-parallax"} />
        </div>
      </div>
    `;
  }

  // Cover media — the full-width banner. A project-level `cover` image wins;
  // otherwise videos autoplay muted (background mode), galleries use their
  // first slide.
  // The first cover on a page sits above the fold — load it eagerly and at
  // high priority; everything below stays lazy.
  function coverLoadAttrs(eager) {
    return eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  }

  // Instant poster for video covers: a self-hosted thumbnail (downloaded once
  // from Vimeo/YouTube into assets/covers/) that paints right away and fades
  // out once the player iframe has booted (see initCoverPosters). Posters are
  // invisible until their image has actually decoded, so a missing file can
  // never show a broken-image icon — worst case is the plain black banner.
  // New work? Save its thumbnail as assets/covers/{vimeo-id}.jpg
  // (or assets/covers/yt-{youtube-id}.jpg) and it's picked up automatically.
  function coverPosterHtml(project, eager) {
    const media = project.media;
    if (!media) return "";
    let src = "";
    if (media.type === "vimeo") {
      src = `assets/covers/${media.id}.jpg`;
    } else if (media.type === "iframe-src" && /youtube\.com\/embed\//.test(media.src)) {
      const id = media.src.split("/embed/")[1].split("?")[0];
      src = `assets/covers/yt-${id}.jpg`;
    } else if (media.type === "iframe-src") {
      const vm = media.src.match(/player\.vimeo\.com\/video\/(\d+)/);
      if (vm) src = `assets/covers/${vm[1]}.jpg`;
    }
    if (!src) return "";
    return `<img class="cover-poster" src="${src}" alt="" ${coverLoadAttrs(eager)} decoding="async" draggable="false" aria-hidden="true" />`;
  }

  function renderCoverMedia(project, eager) {
    if (project.cover) {
      return `<img src="${project.cover}" alt="" ${coverLoadAttrs(eager)} decoding="async" draggable="false" />`;
    }
    const media = project.media;
    if (!media) return "";
    if (media.type === "vimeo") {
      return `<iframe src="https://player.vimeo.com/video/${media.id}?background=1&autoplay=1&muted=1&loop=1" title="" ${coverLoadAttrs(eager)} allow="autoplay; fullscreen" tabindex="-1"></iframe>${coverPosterHtml(project, eager)}`;
    }
    if (media.type === "iframe-src") {
      let src = media.src;
      const sep = src.includes("?") ? "&" : "?";
      if (/youtube\.com\/embed\//.test(src)) {
        const id = src.split("/embed/")[1].split("?")[0];
        src += `${sep}autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1`;
      } else if (/player\.vimeo\.com/.test(src)) {
        src += `${sep}background=1&autoplay=1&muted=1&loop=1`;
      }
      return `<iframe src="${src}" title="" ${coverLoadAttrs(eager)} allow="autoplay; fullscreen" tabindex="-1"></iframe>${coverPosterHtml(project, eager)}`;
    }
    if (media.type === "video") {
      // a separate silent teaser can drive the moving thumbnail while the main
      // player (media.src) carries sound
      const coverSrc = project.coverVideo || media.src;
      return `<video src="${coverSrc}"${media.poster ? ` poster="${media.poster}"` : ""} autoplay muted loop playsinline preload="metadata" tabindex="-1"></video>`;
    }
    if (media.type === "gallery" && media.slides?.length) {
      return `<img src="${media.slides[0].src}" alt="" ${coverLoadAttrs(eager)} decoding="async" draggable="false" />`;
    }
    return "";
  }

  function renderProject(project, index, total, useCovers) {
    const hasTitle = (project.title || "").trim().length > 0;
    const hasBody = (project.bodyHtml || "").trim().length > 0;

    // Cover mode: a full-bleed autoplaying banner carries the title; clicking
    // it slides the full work (player, text, details) open underneath.
    if (useCovers && hasTitle) {
      return `
      <article class="project work">
        <button class="work-cover" type="button" data-work-toggle aria-expanded="false" data-cursor-label="Open">
          <span class="work-cover-media${project.coverFit ? " work-cover-media--fit" : ""}${project.coverWide ? " work-cover-media--wide" : ""}" aria-hidden="true">${renderCoverMedia(project, index === 0)}</span>
          <span class="work-cover-shade" aria-hidden="true"></span>
          <span class="work-cover-text">
            <span class="work-cover-title">${escapeHtml(project.title)}</span>
            ${project.kicker ? `<span class="work-cover-kicker mono">${escapeHtml(project.kicker)}</span>` : ""}
          </span>
          <span class="work-cover-cta mono" aria-hidden="true" data-work-cta>[ Open work + ]</span>
        </button>
        <div class="work-detail">
          <div class="work-detail-inner">
            ${renderMedia(project.media, project.title, { defer: true })}
            ${
              hasBody
                ? `
            <div class="project-body">
              <div class="project-aside mono"><span>↳</span></div>
              <div class="project-text">${project.bodyHtml}</div>
            </div>`
                : ""
            }
            ${project.postMedia ? renderMedia(project.postMedia, project.title, { defer: true }) : ""}
            <div class="work-detail-foot">
              <button class="work-close mono" type="button" data-work-close>[ Close − ]</button>
            </div>
          </div>
        </div>
      </article>
      `;
    }

    return `
      <article class="project">
        ${
          hasTitle
            ? `
        <header class="project-head">
          <span class="project-num mono" data-reveal>[&nbsp;${pad2(index + 1)}&nbsp;/&nbsp;${pad2(total)}&nbsp;]</span>
          <h3 class="project-title" data-split>${escapeHtml(project.title)}</h3>
          ${project.kicker ? `<p class="project-kicker mono" data-reveal>${escapeHtml(project.kicker)}</p>` : ""}
        </header>`
            : ""
        }
        ${renderMedia(project.media, project.title || "Work")}
        ${
          hasBody
            ? `
        <div class="project-body">
          <div class="project-aside mono" data-reveal><span>↳</span></div>
          <div class="project-text" data-reveal>${project.bodyHtml}</div>
        </div>`
            : ""
        }
        ${project.postMedia ? renderMedia(project.postMedia, project.title || "Work") : ""}
      </article>
    `;
  }

  function mountProjects(targetId, items, useCovers) {
    const target = document.getElementById(targetId);
    if (!target || !items) return;
    // entries may carry an explicit `order`; otherwise they keep array order
    const list = items.some((p) => typeof p.order === "number")
      ? [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      : items;
    target.innerHTML = list.map((p, i) => renderProject(p, i, list.length, useCovers)).join("");
  }

  function renderRelease(release, index) {
    return `
      <a class="release" href="${release.url}" target="_blank" rel="noopener noreferrer" data-reveal>
        <span class="release-num mono">${pad2(index + 1)}</span>
        <div class="release-cover" data-tilt>
          <img src="${release.cover}" alt="${escapeHtml(release.title)} cover" loading="lazy" decoding="async" draggable="false" />
        </div>
        <div class="release-info">
          <span class="release-format mono">${escapeHtml(release.format)}</span>
          <h3 class="release-title">${escapeHtml(release.title)}</h3>
          <p class="release-meta mono">${escapeHtml(release.release)} · ${escapeHtml(release.tracks)}</p>
          ${release.note ? `<p class="release-note">${escapeHtml(release.note)}</p>` : ""}
          ${
            release.tags?.length
              ? `<div class="release-tags">${release.tags.map((t) => `<span class="release-tag mono">${escapeHtml(t)}</span>`).join("")}</div>`
              : ""
          }
        </div>
        <span class="release-arrow" aria-hidden="true">↗</span>
      </a>
    `;
  }

  function mountReleases(targetId, items) {
    const target = document.getElementById(targetId);
    if (!target || !items) return;
    target.innerHTML = items.map(renderRelease).join("");
  }

  mountProjects("immersive-sound-list", DATA.immersiveSound, true);
  mountProjects("immersive-experience-list", DATA.immersiveExperience, true);
  mountProjects("creative-coding-list", DATA.creativeCoding, true);
  mountProjects("creative-coding-extra-gallery", DATA.creativeCodingExtraGallery);
  mountReleases("release-music-list", DATA.releases);

  /* ── smooth scrolling (Lenis) ─────────────────────────────────────────── */

  // Native scrolling only. A rAF-driven smooth-scroll library (Lenis) lagged
  // 1–2s and snapped to wrong positions whenever the main thread was busy
  // (the homepage hero sketch saturates it). Native scroll stays in sync.
  const lenis = null;

  function scrollToTop() {
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  /* ── header / nav ─────────────────────────────────────────────────────── */

  function currentPage() {
    const file = window.location.pathname.split("/").pop();
    return file || "index.html";
  }

  document.querySelectorAll(".main-nav a, .menu-nav a").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("#")[0];
    if (href === currentPage()) link.classList.add("is-active");
  });

  const menuToggle = document.getElementById("menu-toggle");
  const menuOverlay = document.getElementById("menu-overlay");
  if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", () => {
      const open = html.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuOverlay.setAttribute("aria-hidden", String(!open));
      menuToggle.textContent = open ? "Close" : "Menu";
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }

  function closeMenu() {
    if (!html.classList.contains("menu-open")) return;
    html.classList.remove("menu-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "Menu";
    }
    if (menuOverlay) menuOverlay.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
  }

  /* ── page transitions (glitch dissolve) ───────────────────────────────── */

  const veil = document.querySelector(".veil");
  const veilFill = veil && veil.querySelector(".veil-fill");
  const veilBars = veil ? veil.querySelectorAll(".veil-bar") : [];
  const veilStrip = veil && veil.querySelector(".veil-strip");

  const rnd = (a, b) => a + Math.random() * (b - a);

  // Glitch dissolve — the calmer "first version" feel: #page tears as a
  // FULL-WIDTH horizontal slice shoved sideways, and clean full-width white
  // band lines flash at the tear (x:0, so they always span the whole width).
  // A short `near` window concentrates the glitch so it reads smooth and
  // natural rather than busy. A thin red strip sits on the left edge.
  // `mode` is "out" (leaving) or "in" (arriving).
  function pageGlitch(mode, onComplete) {
    const page = document.getElementById("page");
    if (!page || !veil) {
      if (onComplete) onComplete();
      return;
    }
    const FRAMES = 9;
    const step = 0.045;
    const tl = gsap.timeline({ onComplete });

    gsap.set(veil, { opacity: 1 });

    for (let i = 0; i < FRAMES; i++) {
      const at = i * step;
      const top = Math.round(rnd(0, 66));
      const bot = Math.round(rnd(0, 86 - top));
      const shove = (Math.random() - 0.5) * 30;
      const near = mode === "out" ? i >= FRAMES - 4 : i < 4; // glitch concentrates here
      const bandY = top;
      const bandH = Math.max(5, 100 - top - bot);

      // #page tears as a full-width horizontal slice, shoved sideways
      tl.set(page, {
        clipPath: `inset(${top}% 0% ${bot}% 0%)`,
        x: shove,
        skewX: (Math.random() - 0.5) * 4,
        opacity: i % 2 ? (mode === "out" && near ? 0.32 : 0.72) : 1
      }, at);

      // clean full-width white band lines at the tear (x:0 → always full width)
      veilBars.forEach((bar, bi) => {
        const h = bi === 0 ? Math.min(bandH, 24) : rnd(1.5, 5);
        tl.set(bar, {
          display: near ? "block" : "none",
          x: 0,
          scaleX: 1,
          top: Math.min(95, bandY + bi * 7) + "%",
          height: h + "%",
          opacity: near ? rnd(0.5, 0.9) : 0
        }, at);
      });

      // thin red strip on the left edge at the tear (kept by request)
      tl.set(veilStrip, {
        display: near ? "block" : "none",
        top: bandY + "%",
        height: bandH + "%",
        width: rnd(4, 8) + "px",
        opacity: near ? rnd(0.7, 1) : 0
      }, at);

      // dark fill cover envelope (rises while leaving, falls while arriving)
      const cover = mode === "out"
        ? (near ? (i % 2 ? 0.6 : 0.95) : 0)
        : Math.max(0, (i % 2 ? 0.85 : 0.45) - i * 0.12);
      tl.set(veilFill, { opacity: cover }, at);
    }

    // settle
    tl.set([...veilBars, veilStrip], { display: "none", opacity: 0 });
    if (mode === "out") {
      tl.set(veilFill, { opacity: 1 });
      tl.set(page, { clipPath: "inset(0% 0% 0% 0%)", x: 0, skewX: 0, opacity: 0 });
    } else {
      tl.set(veilFill, { opacity: 0 });
      tl.set(page, { clearProps: "clipPath,transform,opacity" });
      tl.set(veil, { opacity: 0 });
    }
    return tl;
  }

  function veilIn(onDone) {
    if (!ANIM || !veil) {
      onDone();
      return;
    }
    let fired = false;
    const go = () => { if (!fired) { fired = true; onDone(); } };
    pageGlitch("out", go);
    // safety: if rAF stalls (e.g. tab backgrounded mid-transition), still navigate
    setTimeout(go, 800);
  }

  function veilOut() {
    if (!veil) {
      html.classList.remove("is-veiled");
      return 0;
    }
    gsap.set(veil, { opacity: 1 });
    if (veilFill) gsap.set(veilFill, { opacity: 1 });
    const clear = () => {
      html.classList.remove("is-veiled");
      gsap.set(veil, { clearProps: "opacity" });
    };
    pageGlitch("in", clear);
    // safety: never leave the new page stranded under the veil
    setTimeout(() => { if (html.classList.contains("is-veiled")) clear(); }, 1400);
    return 0.5;
  }

  function transitionTo(href) {
    closeMenu();
    try { sessionStorage.setItem("ii-veil", "1"); } catch (err) {}
    veilIn(() => { window.location.href = href; });
  }

  document.addEventListener("click", (e) => {
    if (!ANIM) return;
    const link = e.target.closest("a[href]");
    if (!link || link.target === "_blank") return;
    const href = link.getAttribute("href");
    if (!href || !href.includes(".html") || href.startsWith("http")) return;
    const [page] = href.split("#");
    if (page === currentPage()) {
      // same-page anchors scroll natively; same-page links do nothing
      if (!href.includes("#")) e.preventDefault();
      return;
    }
    e.preventDefault();
    transitionTo(href);
  });

  /* ── scroll-driven + entrance animations ──────────────────────────────── */

  function showEverything() {
    // No-animation path: make sure nothing is left hidden.
    html.classList.remove("is-loading");
    const pre = document.getElementById("preloader");
    if (pre) pre.remove();
    html.classList.remove("is-veiled");
  }

  function initScrollAnimations() {
    if (!window.ScrollTrigger) return;

    // generic fade-up reveals
    const reveals = gsap.utils.toArray("[data-reveal]");
    if (reveals.length) {
      gsap.set(reveals, { y: 30, opacity: 0 });
      ScrollTrigger.batch(reveals, {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" })
      });
    }

    // character-mask heading reveals
    gsap.utils.toArray("[data-split]").forEach((el) => {
      const chars = splitChars(el);
      gsap.set(chars, { yPercent: 120 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(chars, { yPercent: 0, duration: 0.9, stagger: 0.016, ease: "power4.out" })
      });
    });

    // media reveals — transform + opacity only (GPU-composited; clip-path on
    // an <iframe> forces a full repaint every frame and reads as jittery)
    gsap.utils.toArray("[data-media-reveal]").forEach((frame) => {
      gsap.fromTo(
        frame,
        { y: 46, autoAlpha: 0, scale: 0.97 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: frame, start: "top 90%", once: true }
        }
      );
    });

    // gentle parallax for plain images
    gsap.utils.toArray("[data-parallax]").forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: img.closest(".media-frame") || img, scrub: 1 }
        }
      );
    });

    // top progress bar
    const bar = document.querySelector(".progress-bar");
    if (bar) {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 }
        }
      );
    }
  }

  function runIntro(extraDelay = 0) {
    html.classList.remove("is-loading");
    const tl = gsap.timeline({ delay: extraDelay, defaults: { ease: "power4.out" } });

    tl.fromTo(".site-header", { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.05);

    const heroTitles = document.querySelectorAll("[data-split-intro]");
    heroTitles.forEach((el, i) => {
      const chars = el.querySelectorAll(".split-char");
      tl.to(chars, { yPercent: 0, duration: 1.15, stagger: 0.028, ease: "power4.out" }, 0.12 + i * 0.1);
    });

    const fades = document.querySelectorAll("[data-intro-fade]");
    if (fades.length) tl.to(fades, { y: 0, opacity: 1, duration: 0.95, stagger: 0.08 }, 0.45);

    const rules = document.querySelectorAll("[data-intro-rule]");
    if (rules.length) tl.to(rules, { scaleX: 1, duration: 1.2, ease: "power3.inOut" }, 0.4);

    tl.add(() => window.ScrollTrigger && ScrollTrigger.refresh(), 0.6);
  }

  function boot() {
    if (!ANIM) {
      showEverything();
      return;
    }

    // pre-hide intro elements
    document.querySelectorAll("[data-split-intro]").forEach((el) => {
      const chars = splitChars(el);
      gsap.set(chars, { yPercent: 120 });
    });
    if (document.querySelector("[data-intro-fade]")) gsap.set("[data-intro-fade]", { y: 26, opacity: 0 });
    if (document.querySelector("[data-intro-rule]")) gsap.set("[data-intro-rule]", { scaleX: 0, transformOrigin: "left center" });

    initScrollAnimations();

    const veiled = html.classList.contains("is-veiled");
    const preloader = document.getElementById("preloader");
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("ii-seen");
      sessionStorage.setItem("ii-seen", "1");
    } catch (err) {}

    if (preloader && !seen && !veiled) {
      const counter = preloader.querySelector("[data-preloader-count]");
      const state = { n: 0 };
      const tl = gsap.timeline();
      tl.fromTo(".preloader-inner > *", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" });
      tl.to(state, {
        n: 100,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counter) counter.textContent = pad2(Math.round(state.n));
        }
      }, 0.1);
      tl.to(preloader, {
        yPercent: -100,
        duration: 0.85,
        ease: "power4.inOut",
        onComplete: () => preloader.remove()
      }, "+=0.15");
      tl.add(() => runIntro(), "-=0.55");
    } else {
      if (preloader) preloader.remove();
      let wait = 0;
      if (veiled) wait = veilOut() * 0.45;
      runIntro(wait);
    }
  }

  /* ── galleries ────────────────────────────────────────────────────────── */

  function initGalleries() {
    document.querySelectorAll("[data-gallery]").forEach((gallery) => {
      const track = gallery.querySelector("[data-gallery-track]");
      const slides = gallery.querySelectorAll(".gallery-slide");
      const count = gallery.querySelector("[data-gallery-count]");
      const prev = gallery.querySelector("[data-gallery-prev]");
      const next = gallery.querySelector("[data-gallery-next]");
      if (!track || slides.length === 0) return;

      let index = 0;
      let timer = null;

      function go(to) {
        index = (to + slides.length) % slides.length;
        if (ANIM) gsap.to(track, { xPercent: -100 * index, duration: 0.8, ease: "power3.inOut", overwrite: true });
        else track.style.transform = `translateX(-${index * 100}%)`;
        if (count) count.textContent = `${pad2(index + 1)} / ${pad2(slides.length)}`;
      }

      function play() {
        stop();
        if (slides.length <= 1 || reducedMotion) return;
        timer = setInterval(() => go(index + 1), 5200);
      }
      function stop() {
        if (timer) clearInterval(timer);
        timer = null;
      }

      prev?.addEventListener("click", () => { go(index - 1); play(); });
      next?.addEventListener("click", () => { go(index + 1); play(); });

      // swipe / drag
      let startX = null;
      const frame = gallery.querySelector(".gallery");
      frame?.addEventListener("pointerdown", (e) => { startX = e.clientX; stop(); });
      window.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        play();
      });

      gallery.addEventListener("mouseenter", stop);
      gallery.addEventListener("mouseleave", play);
      gallery.addEventListener("focusin", stop);
      gallery.addEventListener("focusout", play);

      go(0);
      play();
    });
  }

  /* ── custom cursor ────────────────────────────────────────────────────── */

  function initCursor() {
    const cursor = document.querySelector(".cursor");
    // The home artwork renders its own crosshair cursor; don't stack the
    // site cursor on top of it there.
    if (!cursor || !finePointer || !ANIM || document.body.dataset.page === "patch") {
      cursor?.remove();
      return;
    }
    const dot = cursor.querySelector(".cursor-dot");
    const ring = cursor.querySelector(".cursor-ring");
    const label = cursor.querySelector(".cursor-label");
    const tR = cursor.querySelector(".cursor-trail--r");
    const tC = cursor.querySelector(".cursor-trail--c");

    const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    // RGB trail dots lag further behind — the faster you move, the more the
    // red/cyan ghosts separate and brighten (chromatic delay scales with speed).
    const rX = gsap.quickTo(tR, "x", { duration: 0.26, ease: "power2" });
    const rY = gsap.quickTo(tR, "y", { duration: 0.26, ease: "power2" });
    const cX = gsap.quickTo(tC, "x", { duration: 0.42, ease: "power2" });
    const cY = gsap.quickTo(tC, "y", { duration: 0.42, ease: "power2" });

    let shown = false;
    let lastX = 0, lastY = 0, lastT = performance.now();
    let speed = 0;

    window.addEventListener("pointermove", (e) => {
      if (!shown) {
        html.classList.add("cursor-active");
        shown = true;
        lastX = e.clientX; lastY = e.clientY;
      }
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      const v = Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt; // px per ms
      speed += (Math.min(v / 2.2, 1) - speed) * 0.35;
      lastX = e.clientX; lastY = e.clientY; lastT = now;

      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
      rX(e.clientX); rY(e.clientY);
      cX(e.clientX); cY(e.clientY);
    }, { passive: true });

    // drive trail opacity from (decaying) speed every frame
    gsap.ticker.add(() => {
      speed *= 0.9;
      const hidden = !shown || html.classList.contains("cursor-hidden");
      const amt = hidden ? 0 : Math.min(speed * 1.4, 1);
      tR.style.opacity = amt * 0.85;
      tC.style.opacity = amt * 0.85;
    });

    document.addEventListener("pointerover", (e) => {
      if (e.target.closest("iframe")) {
        html.classList.add("cursor-hidden");
        return;
      }
      html.classList.remove("cursor-hidden");
      const target = e.target.closest("a, button, [data-cursor-label]");
      if (target) {
        html.classList.add("cursor-link");
        const text = target.closest("[data-cursor-label]")?.dataset.cursorLabel || "";
        if (label) label.textContent = text;
        cursor.classList.toggle("has-label", !!text);
      } else {
        html.classList.remove("cursor-link");
        cursor.classList.remove("has-label");
      }
    });

    document.addEventListener("pointerleave", () => html.classList.remove("cursor-active"));
    document.addEventListener("pointerenter", () => shown && html.classList.add("cursor-active"));
  }

  /* ── cover posters: instant still → video fades in over it ───────────── */

  function initCoverPosters() {
    document.querySelectorAll(".work-cover-media").forEach((media) => {
      const poster = media.querySelector(".cover-poster");
      if (!poster) return;
      const iframe = media.querySelector("iframe");
      if (!iframe) {
        poster.remove();
        return;
      }
      // the poster only becomes visible once its image has really decoded —
      // a pending or missing file shows nothing (plain black), never an icon
      const ready = () => poster.classList.add("is-ready");
      if (poster.complete && poster.naturalWidth > 0) ready();
      else poster.addEventListener("load", ready, { once: true });
      poster.addEventListener("error", () => poster.remove(), { once: true });
      // once the player document has loaded, give it a beat to paint its own
      // first frame, then dissolve the poster
      iframe.addEventListener("load", () => {
        setTimeout(() => poster.classList.add("is-done"), 700);
      }, { once: true });
    });
  }

  /* ── visual page: alternating hero background video ───────────────────── */

  // Two Vimeo films behind the top of the page, one at a time. A random one
  // starts; when it ends the other crossfades in, and so on.
  function initVisHeroBg() {
    const frames = Array.from(document.querySelectorAll("[data-vimeo-hero]"));
    if (frames.length < 2) return;

    let active = Math.random() < 0.5 ? 0 : 1;

    // no Vimeo API (or reduced motion): just show one film looping
    if (reducedMotion || typeof window.Vimeo === "undefined" || !window.Vimeo.Player) {
      frames[active].classList.add("is-live");
      return;
    }

    try {
      const players = frames.map((f) => new Vimeo.Player(f));
      let swapping = false;

      function show(i) {
        const p = players[i];
        p.setLoop(false).catch(() => {});
        p.setCurrentTime(0).catch(() => {});
        p.play().catch(() => {});
        frames[i].classList.add("is-live");
        frames[1 - i].classList.remove("is-live");
        players[1 - i].pause().catch(() => {});
        active = i;
      }

      players.forEach((p, i) => {
        p.ready().then(() => { p.setLoop(false).catch(() => {}); if (i !== active) p.pause().catch(() => {}); }).catch(() => {});
        p.on("ended", () => {
          if (i !== active || swapping) return;
          swapping = true;
          show(1 - active);
          setTimeout(() => { swapping = false; }, 1400);
        });
      });

      show(active);
    } catch (err) {
      frames[active].classList.add("is-live");
    }
  }

  /* ── visual page: full-bleed video gallery ────────────────────────────── */

  // Full-width sliding gallery of muted looping videos. Shuffled each load,
  // auto-advances on a timer, drag to slide (no arrows). Only the current
  // slide plays; the rest stay paused and load lazily.
  function initVisVideoGallery() {
    const gallery = document.getElementById("vis-video-gallery");
    if (!gallery) return;
    const sources = (DATA.visualVideos || []).slice();
    if (!sources.length) { gallery.remove(); return; }

    // ── TUNE HERE ────────────────────────────────────────────────────────
    // How long each video stays on screen before sliding to the next (ms).
    const AUTO_ADVANCE_MS = parseInt(gallery.dataset.interval, 10) || 30000;
    // ─────────────────────────────────────────────────────────────────────

    // random order every load
    for (let i = sources.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [sources[i], sources[j]] = [sources[j], sources[i]];
    }

    const track = document.createElement("div");
    track.className = "vid-track";
    sources.forEach((src, i) => {
      const slide = document.createElement("div");
      slide.className = "vid-slide";
      const v = document.createElement("video");
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute("tabindex", "-1");
      v.preload = i === 0 ? "auto" : "none";
      if (i === 0) v.src = src; else v.dataset.src = src;
      slide.appendChild(v);
      track.appendChild(slide);
    });
    gallery.appendChild(track);

    const slides = Array.from(track.children);
    const N = slides.length;
    let index = 0;
    let visible = true;
    let timer = null;

    const videoAt = (i) => slides[i].querySelector("video");

    function ensureLoaded(i) {
      const v = videoAt(i);
      if (v && v.dataset.src) { v.src = v.dataset.src; delete v.dataset.src; }
      return v;
    }
    function playOnly(i) {
      slides.forEach((s, si) => {
        const v = s.querySelector("video");
        if (si === i) {
          ensureLoaded(i);
          if (visible && !reducedMotion) v.play?.().catch(() => {});
        } else {
          v.pause?.();
        }
      });
      ensureLoaded((i + 1) % N); // warm the next one for a smooth slide
    }

    function setX(pct, animate) {
      if (animate && ANIM) gsap.to(track, { xPercent: pct, duration: 0.9, ease: "power3.inOut", overwrite: true });
      else { if (ANIM) gsap.set(track, { xPercent: pct }); else track.style.transform = `translateX(${pct}%)`; }
    }
    function go(to, animate = true, wrap = true) {
      index = wrap ? (to + N) % N : Math.max(0, Math.min(N - 1, to));
      setX(-100 * index, animate);
      playOnly(index);
    }

    function startTimer() {
      stopTimer();
      if (N <= 1 || reducedMotion) return;
      timer = setInterval(() => go(index + 1), AUTO_ADVANCE_MS);
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

    // minimal side arrows — clicking wraps, so the gallery loops start↔end
    ["prev", "next"].forEach((dir) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `vid-nav vid-nav--${dir} mono`;
      btn.setAttribute("aria-label", dir === "prev" ? "Previous video" : "Next video");
      btn.textContent = dir === "prev" ? "←" : "→";
      btn.addEventListener("click", () => {
        go(dir === "prev" ? index - 1 : index + 1); // wraps (loops to start)
        startTimer();
      });
      gallery.appendChild(btn);
    });

    // drag to slide (live feedback, snap on release)
    let dragging = false, startX = 0, dragged = 0, w = 0;
    gallery.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".vid-nav")) return; // arrows aren't drag handles
      dragging = true;
      startX = e.clientX;
      dragged = 0;
      w = gallery.clientWidth || 1;
      stopTimer();
      gallery.setPointerCapture?.(e.pointerId);
    });
    gallery.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dragged = e.clientX - startX;
      // clamp within the first/last slide so you can never drag into black
      let pct = -100 * index + (dragged / w) * 100;
      pct = Math.max(-100 * (N - 1), Math.min(0, pct));
      if (ANIM) gsap.set(track, { xPercent: pct }); else track.style.transform = `translateX(${pct}%)`;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      const threshold = w * 0.12;
      // drag snaps to an adjacent slide without wrapping (no jump to black)
      if (dragged < -threshold) go(index + 1, true, false);
      else if (dragged > threshold) go(index - 1, true, false);
      else go(index, true, false); // snap back
      startTimer();
    }
    gallery.addEventListener("pointerup", endDrag);
    gallery.addEventListener("pointercancel", endDrag);

    // pause everything when the gallery is off-screen
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        visible = en.isIntersecting;
        if (visible) { playOnly(index); startTimer(); }
        else { slides.forEach((s) => s.querySelector("video").pause?.()); stopTimer(); }
      });
    }, { threshold: 0.15 });
    io.observe(gallery);

    go(0, false);
    startTimer();
  }

  /* ── visual page: still-image flicker montage ─────────────────────────── */

  // A single full-bleed frame flips through the still images in random order at
  // a fast interval. Images crop to fill (object-fit: cover). Loads lazily when
  // the section is approached; pauses when off-screen or reduced-motion.
  function initVisStillImages() {
    const wrap = document.getElementById("vis-still-flicker");
    if (!wrap) return;
    const stills = (DATA.visualStills || []).slice();
    if (!stills.length) { wrap.remove(); return; }

    // ── TUNE HERE ─────────────────────────────────────────────────────────
    // How long each still stays before flipping to a new random one, in ms.
    // Lower = faster montage, higher = slower.
    const CHANGE_MS = 1000;
    // ──────────────────────────────────────────────────────────────────────

    const layers = stills.map((src) => {
      const img = document.createElement("img");
      img.alt = "";
      img.decoding = "async";
      img.draggable = false;
      img.className = "still-layer";
      img.dataset.src = src;
      wrap.appendChild(img);
      return img;
    });
    // each image only downloads the first time it is shown
    const ensure = (i) => {
      const im = layers[i];
      if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
    };

    let cur = 0;
    ensure(0);
    layers[0].classList.add("is-on");
    if (reducedMotion || layers.length < 2) return; // leave a single static frame

    let visible = true;
    let timer = null;
    function tick() {
      let n = cur;
      while (n === cur) n = (Math.random() * layers.length) | 0;
      ensure(n);
      layers[cur].classList.remove("is-on");
      layers[n].classList.add("is-on");
      cur = n;
    }
    function start() { stop(); if (visible) timer = setInterval(tick, CHANGE_MS); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    // pause the montage while it's off-screen
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { visible = e.isIntersecting; visible ? start() : stop(); });
    }, { threshold: 0.1 });
    io.observe(wrap);
    start();
  }

  /* ── docs accordion (MOPs documentation) ──────────────────────────────── */

  function initDocsAccordion() {
    document.querySelectorAll("[data-acc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".acc-item");
        if (!item) return;
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
        setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 600);
      });
    });
  }

  /* ── work covers: expand the full work under its banner ──────────────── */

  function initWorkToggles() {
    function setOpen(art, btn, open) {
      art.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      const cta = btn.querySelector("[data-work-cta]");
      if (cta) cta.textContent = open ? "[ Close − ]" : "[ Open work + ]";
      // keep the custom cursor label in sync while still hovering
      btn.dataset.cursorLabel = open ? "Close" : "Open";
      const cursor = document.querySelector(".cursor");
      if (cursor?.classList.contains("has-label")) {
        const label = cursor.querySelector(".cursor-label");
        if (label) label.textContent = btn.dataset.cursorLabel;
      }
      if (open) {
        // detail players and clips only load the first time a work is opened
        art.querySelectorAll("iframe[data-src], video[data-src]").forEach((el) => {
          el.src = el.dataset.src;
          el.removeAttribute("data-src");
          // background loop clips (no controls) autoplay muted; real players
          // with controls wait for the user (so their sound isn't muted)
          if (el.tagName === "VIDEO" && !el.controls && !reducedMotion) {
            el.muted = true;
            el.play?.().catch(() => {});
          }
        });
        art.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
      // the page just changed height — let scroll-driven bits re-measure
      setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 800);
    }

    document.querySelectorAll("[data-work-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const art = btn.closest(".project");
        if (!art) return;
        setOpen(art, btn, !art.classList.contains("is-open"));
      });
    });

    // close button at the foot of an opened work — collapse without scrolling
    // all the way back up manually
    document.querySelectorAll("[data-work-close]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        const art = closeBtn.closest(".project");
        const toggle = art && art.querySelector("[data-work-toggle]");
        if (!art || !toggle) return;
        setOpen(art, toggle, false);
        // pause any playing detail video so sound stops on collapse
        art.querySelectorAll(".work-detail video").forEach((v) => v.pause?.());
        toggle.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      });
    });
  }

  /* ── magnetic elements + release tilt ─────────────────────────────────── */

  function initMagnetic() {
    if (!finePointer || !ANIM) return;
    document.querySelectorAll(".magnetic").forEach((el) => {
      let rect = null;
      el.addEventListener("pointerenter", () => { rect = el.getBoundingClientRect(); });
      el.addEventListener("pointermove", (e) => {
        if (!rect) return;
        gsap.to(el, {
          x: (e.clientX - (rect.left + rect.width / 2)) * 0.32,
          y: (e.clientY - (rect.top + rect.height / 2)) * 0.32,
          duration: 0.45,
          ease: "power3.out"
        });
      });
      el.addEventListener("pointerleave", () => {
        rect = null;
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.35)" });
      });
    });
  }

  function initTilt() {
    if (!finePointer || !ANIM) return;
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, {
          rotationY: px * 9,
          rotationX: -py * 9,
          transformPerspective: 700,
          duration: 0.5,
          ease: "power2.out"
        });
      });
      el.addEventListener("pointerleave", () => {
        gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ── footer: local time, year, back-to-top ────────────────────────────── */

  function initFooter() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const timeEls = [document.getElementById("local-time"), document.getElementById("hud-time")].filter(Boolean);
    if (timeEls.length) {
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      const tick = () => {
        const t = fmt.format(new Date());
        timeEls.forEach((el) => { el.textContent = t; });
      };
      tick();
      setInterval(tick, 1000);
    }

    document.getElementById("to-top")?.addEventListener("click", scrollToTop);
  }

  /* ── HUD: status bar with the signal rail ───────────────────────── */

  // The rail is the sitewide miniature of the homepage string: one line,
  // a cue tick per page (current lit), scroll position as the playhead.
  const RAIL = [
    ["SND", "sound.html", "#ff1a1a"],
    ["VIS", "immersive-experience.html", "#18e0ff"],
    ["CDE", "creative-coding.html", "#09f668"],
    ["MOP", "mops.html", "#ff8614"],
    ["MUS", "released-music.html", "#9260f3"],
    ["ABT", "about-contact.html", "#edebe6"]
  ];

  function initHud() {
    const hud = document.querySelector(".hud");
    if (!hud) return;

    function scrollFrac() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, window.scrollY / max) : 0;
    }

    const pct = hud.querySelector("[data-hud-scroll]");
    if (pct) {
      const onScroll = () => {
        pct.textContent = `SCR ${String(Math.round(scrollFrac() * 100)).padStart(3, "0")}%`;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
    }

    const canvas = hud.querySelector(".hud-scope");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth || 190;
      H = canvas.offsetHeight || 16;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size, { passive: true });

    const cur = currentPage();
    let mx = -1e4;
    canvas.addEventListener("pointermove", (e) => {
      mx = e.clientX - canvas.getBoundingClientRect().left;
    }, { passive: true });
    canvas.addEventListener("pointerleave", () => { mx = -1e4; });
    canvas.addEventListener("click", (e) => {
      const x = e.clientX - canvas.getBoundingClientRect().left;
      const i = Math.max(0, Math.min(RAIL.length - 1, Math.floor((x / W) * RAIL.length)));
      if (RAIL[i][1] !== cur) transitionTo(RAIL[i][1]);
    });

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        let yy = mid + Math.sin(x * 0.05 + t * 1.6) * 1.1;
        if (mx > -9000) {
          const d = Math.abs(x - mx);
          if (d < 34) yy += Math.sin((1 - d / 34) * Math.PI) * 2.6;
        }
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = "rgba(237, 235, 230, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
      RAIL.forEach(([, href, tint], i) => {
        const x = ((i + 0.5) / RAIL.length) * W;
        const on = href === cur;
        ctx.strokeStyle = tint;
        ctx.globalAlpha = on ? 1 : 0.42;
        ctx.beginPath();
        ctx.moveTo(x, mid - (on ? 5 : 3.5));
        ctx.lineTo(x, mid + (on ? 5 : 3.5));
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      // playhead — scroll progress travels within the current page's segment
      // of the rail, not across the whole line
      const seg = RAIL.findIndex(([, href]) => href === cur);
      const phx = seg >= 0 ? ((seg + scrollFrac()) / RAIL.length) * W : scrollFrac() * W;
      ctx.beginPath();
      ctx.arc(phx, mid, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ff1a1a";
      ctx.fill();
    }

    if (reducedMotion) {
      draw();
      window.addEventListener("scroll", draw, { passive: true });
      return;
    }
    let last = 0;
    function loop(now) {
      requestAnimationFrame(loop);
      if (document.hidden || now - last < 33) return;
      last = now;
      t += 0.033;
      draw();
    }
    requestAnimationFrame(loop);
  }

  /* ── text scramble (decode-on-hover) ──────────────────────────────────── */

  const GLYPHS = "▮▯░<>/\\|=+*#_01";

  function scrambleOnce(el) {
    if (el.dataset.scrambling) return;
    const original = el.dataset.scrambleText || (el.dataset.scrambleText = el.textContent);
    el.dataset.scrambling = "1";
    const len = original.length;
    const dur = 380 + len * 8;
    const start = performance.now();
    function frame(now) {
      const t = (now - start) / dur;
      if (t >= 1) {
        el.textContent = original;
        delete el.dataset.scrambling;
        return;
      }
      let out = "";
      const lock = Math.floor(t * len);
      for (let i = 0; i < len; i++) {
        const ch = original[i];
        out += i < lock || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initScramble() {
    if (!ANIM || !finePointer) return;
    document.querySelectorAll("[data-scramble]").forEach((el) => {
      const trigger = el.closest("a, button") || el;
      trigger.addEventListener("pointerenter", () => scrambleOnce(el));
    });
  }

  /* ── MOPs module rack: mini signal visualizations ─────────────────────── */

  function initModules() {
    const canvases = document.querySelectorAll("[data-module-viz]");
    if (!canvases.length) return;

    const FG = "#ff1a1a";
    const DIM = "rgba(237, 235, 230, 0.28)";

    const draws = {
      // oscillator — clean sine sweeping
      osc(ctx, W, H, t) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = H / 2 + Math.sin((x / W) * Math.PI * 4 + t * 2) * H * 0.32;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = FG;
        ctx.stroke();
      },
      // filter — response curve with moving cutoff + resonance bump
      flt(ctx, W, H, t) {
        const cut = W * (0.35 + Math.sin(t * 0.9) * 0.22);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const d = (x - cut) / (W * 0.12);
          const res = Math.exp(-d * d) * H * 0.28;
          const roll = x < cut ? 0 : Math.min((x - cut) / (W * 0.3), 1) * H * 0.55;
          const y = H * 0.72 - H * 0.3 - res + roll;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = FG;
        ctx.stroke();
        ctx.strokeStyle = DIM;
        ctx.beginPath();
        ctx.moveTo(cut, H * 0.1);
        ctx.lineTo(cut, H * 0.9);
        ctx.stroke();
      },
      // envelope — ADSR shape whose decay/sustain breathe
      env(ctx, W, H, t) {
        const s = 0.45 + Math.sin(t * 1.4) * 0.15;
        const pts = [
          [0, H * 0.9],
          [W * 0.18, H * 0.12],
          [W * 0.38, H * (1 - s)],
          [W * 0.72, H * (1 - s)],
          [W, H * 0.9]
        ];
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.strokeStyle = FG;
        ctx.stroke();
      },
      // sequencer — 8 steps, playhead advancing
      seq(ctx, W, H, t) {
        const steps = 8;
        const gap = 3;
        const w = (W - gap * (steps + 1)) / steps;
        const heights = [0.55, 0.85, 0.35, 0.7, 0.5, 0.9, 0.3, 0.65];
        const active = Math.floor(t * 2.4) % steps;
        for (let i = 0; i < steps; i++) {
          const h = H * 0.72 * heights[i];
          const x = gap + i * (w + gap);
          ctx.fillStyle = i === active ? FG : DIM;
          ctx.fillRect(x, H * 0.86 - h, w, h);
        }
      },
      // effects — a pulse and its decaying echoes
      fx(ctx, W, H, t) {
        const phase = (t * 0.7) % 1;
        for (let i = 0; i < 5; i++) {
          const p = phase + i * 0.16;
          const x = (p % 1) * W;
          const a = Math.max(0, 1 - i * 0.22);
          const h = H * 0.6 * a;
          ctx.fillStyle = i === 0 ? FG : `rgba(237, 235, 230, ${0.32 * a})`;
          ctx.fillRect(x, (H - h) / 2, 3, h);
        }
      },
      // semi-modular instrument — sine + steps living together
      ins(ctx, W, H, t) {
        draws.seq(ctx, W, H, t * 0.8);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = H * 0.32 + Math.sin((x / W) * Math.PI * 3 + t * 1.6) * H * 0.16;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = FG;
        ctx.stroke();
      }
    };

    const items = [];
    canvases.forEach((canvas) => {
      const type = canvas.dataset.moduleViz;
      if (!draws[type]) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth || 260;
      const H = canvas.clientHeight || 74;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 1.2;
      const item = { canvas, ctx, W, H, type, t: Math.random() * 20, speed: 1, visible: false };
      // hover on the parent module makes the signal run hot
      const module = canvas.closest(".module");
      module?.addEventListener("pointerenter", () => { item.speed = 3; });
      module?.addEventListener("pointerleave", () => { item.speed = 1; });
      items.push(item);
    });
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const item = items.find((it) => it.canvas === e.target);
          if (item) item.visible = e.isIntersecting;
        }),
      { threshold: 0 }
    );
    items.forEach((it) => io.observe(it.canvas));

    if (reducedMotion) {
      // static single frame
      items.forEach((it) => draws[it.type](it.ctx, it.W, it.H, 1.2));
      return;
    }

    let last = 0;
    function loop(now) {
      requestAnimationFrame(loop);
      if (document.hidden || now - last < 33) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      items.forEach((it) => {
        if (!it.visible) return;
        it.t += dt * 1.6 * it.speed;
        it.ctx.clearRect(0, 0, it.W, it.H);
        draws[it.type](it.ctx, it.W, it.H, it.t);
      });
    }
    requestAnimationFrame(loop);
  }

  /* ── the signal: landing-page string menu ─────────────────────── */

  // One playable string spans the viewport; the pages are cue points riding
  // it. The cursor deflects it, click-drag plucks it, ripples propagate.
  function initSignalMenu() {
    const wrap = document.querySelector(".patch");
    const stage = document.querySelector(".sig-stage");
    if (!wrap || !stage) return;
    const canvas = stage.querySelector("canvas");
    const cues = Array.from(stage.querySelectorAll(".cue"));

    const staticMode = !finePointer || reducedMotion || window.innerWidth < 900;
    if (staticMode) {
      wrap.classList.add("patch--static");
      document.body.classList.add("patch-scroll");
      return;
    }

    const ctx = canvas.getContext("2d");
    const N = 190;
    const y = new Float32Array(N);
    const v = new Float32Array(N);
    let W = 0, H = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = stage.clientWidth;
      H = stage.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    const xAt = (i) => (i / (N - 1)) * W;
    const iAt = (x) => Math.max(0, Math.min(N - 1, Math.round((x / W) * (N - 1))));
    const idle = (x, t) => Math.sin(x * 0.006 + t * 1.1) * 3.5 + Math.sin(x * 0.0023 - t * 0.6) * 2.5;

    const tints = cues.map((c) => getComputedStyle(c).getPropertyValue("--cue").trim() || "#ff1a1a");
    let hovered = -1;
    cues.forEach((c, ci) => {
      c.addEventListener("pointerenter", () => {
        hovered = ci;
        const i = iAt(parseFloat(c.dataset.t) * W);
        if (i > 0 && i < N - 1) v[i] -= 1.4; // strike the string at the cue
      });
      c.addEventListener("pointerleave", () => { if (hovered === ci) hovered = -1; });
    });

    // ── designed waveform ────────────────────────────────────────────────
    // The string rises and falls like a waveform so the cues scatter across
    // the page. Each cue has a target height (down = +, up = −); the exact
    // amount is re-rolled every load for variation, and a guard keeps any cue
    // that sits under the wordmark clear of it (the responsive collision fix).
    const VY_BASE = [0.85, -0.8, -0.05, 0.7, -0.6, 0.2]; // SND VIS CDE MOP MUS ABT
    const layout = cues.map((c, i) => {
      const base = VY_BASE[i] === undefined ? 0 : VY_BASE[i];
      let vy = base + (Math.random() - 0.5) * 0.3;
      if (base > 0.25) vy = Math.max(0.42, Math.min(1, vy));
      else if (base < -0.25) vy = Math.max(-1, Math.min(-0.42, vy));
      else vy = Math.max(-0.3, Math.min(0.3, vy));
      return { c, t: parseFloat(c.dataset.t) || 0.5, vy, cy: 0, side: "up" };
    });
    const wordmark = document.querySelector(".patch-wordmark");
    let controls = [];

    function layoutWave() {
      const center = H * 0.5;
      const amp = H * 0.27;
      const topSafe = H * 0.15;
      const botSafe = H * 0.82;
      const CARD = 46, TEXT = 58, HALFW = 115; // approx label card half-width
      const sb = stage.getBoundingClientRect();
      const wm = wordmark ? wordmark.getBoundingClientRect() : null;
      const wmRight = wm ? wm.right - sb.left + 20 : 0;
      const wmBottom = wm ? wm.bottom - sb.top + 18 : 0;

      layout.forEach((L) => {
        const x = L.t * W;
        let cy = center + L.vy * amp;
        let side = L.vy < 0 ? "up" : "down";     // scatter labels outward
        let anchor = "c";
        if (x < wmRight) {                        // the dot itself is under the
          side = "down";                          // wordmark → drop it below
          cy = Math.max(cy, wmBottom);
        } else if (x - HALFW < wmRight) {         // only the centred card reaches
          anchor = "r";                           // under it → extend it rightward
        }
        // keep the label card on screen
        if (side === "up" && cy - CARD - TEXT < topSafe) cy = topSafe + CARD + TEXT;
        if (side === "down" && cy + CARD + TEXT > botSafe) cy = botSafe - CARD - TEXT;
        cy = Math.max(topSafe, Math.min(botSafe, cy));
        L.cy = cy;
        L.side = side;
        L.c.classList.toggle("cue--up", side === "up");
        L.c.classList.toggle("cue--down", side === "down");
        L.c.classList.toggle("cue--anchor-r", anchor === "r");
      });

      const sorted = layout.slice().sort((a, b) => a.t - b.t);
      controls = [{ x: 0, y: center }];
      sorted.forEach((L) => controls.push({ x: L.t * W, y: L.cy }));
      controls.push({ x: W, y: center });
    }

    // smooth (cosine-eased) sample of the waveform between control points
    function sampleWave(x) {
      for (let k = 0; k < controls.length - 1; k++) {
        const a = controls[k], b = controls[k + 1];
        if (x <= b.x) {
          const tt = Math.max(0, Math.min(1, (x - a.x) / Math.max(1, b.x - a.x)));
          const e = 0.5 - 0.5 * Math.cos(tt * Math.PI);
          return a.y + (b.y - a.y) * e;
        }
      }
      return controls[controls.length - 1].y;
    }

    layoutWave();
    setTimeout(layoutWave, 400); // re-measure once fonts/layout settle
    window.addEventListener("resize", () => { size(); layoutWave(); }, { passive: true });

    // The pointer now drives the interactive artwork underneath, so the string
    // is intentionally passive: a gentle idle wave the cues ride, plus a small
    // ripple when a cue label is hovered. No pluck / cursor-drag.
    let tGlobal = 0;
    let last = performance.now();
    let ph = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      tGlobal += dt;
      const t = tGlobal;

      // wave equation
      for (let i = 1; i < N - 1; i++) v[i] += (y[i - 1] + y[i + 1] - 2 * y[i]) * 0.3 - y[i] * 0.012;
      for (let i = 1; i < N - 1; i++) { v[i] *= 0.95; y[i] += v[i]; }
      y[0] = y[N - 1] = 0;

      const pathY = (i) => sampleWave(xAt(i)) + y[i] + idle(xAt(i), t);

      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const X = xAt(i), Y = pathY(i);
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // hovered cue: its stretch of string takes the tint
      if (hovered >= 0) {
        const tc = parseFloat(cues[hovered].dataset.t);
        const i0 = iAt((tc - 0.055) * W), i1 = iAt((tc + 0.055) * W);
        ctx.beginPath();
        for (let i = i0; i <= i1; i++) {
          const X = xAt(i), Y = pathY(i);
          i === i0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
        }
        ctx.strokeStyle = tints[hovered];
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // the playhead pulse travelling the string
      ph = (ph + dt / 11) % 1;
      const pi = iAt(ph * W);
      ctx.beginPath();
      ctx.arc(xAt(pi), pathY(pi), 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "#ff1a1a";
      ctx.fill();

      // cues ride the wave
      cues.forEach((c) => {
        const X = parseFloat(c.dataset.t) * W;
        const Y = pathY(iAt(X));
        c.style.transform = `translate(${X}px, ${Y}px)`;
      });
    }
    requestAnimationFrame(frame);
  }

  /* ── live rules: subpage divider lines are strings too ───────────── */

  const PAGE_TINTS = {
    patch: "#ff1a1a", sound: "#ff1a1a", visual: "#18e0ff", code: "#09f668",
    mops: "#edebe6", music: "#9260f3", about: "#edebe6"
  };

  function initRuleStrings() {
    if (!finePointer || reducedMotion) return;
    const tint = PAGE_TINTS[document.body.dataset.page] || "#ff1a1a";
    document.querySelectorAll(".page-rule").forEach((rule) => {
      rule.classList.add("rule-live");
      const canvas = document.createElement("canvas");
      rule.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      const N = 140;
      const y = new Float32Array(N);
      const v = new Float32Array(N);
      let W = 0, H = 0;
      function size() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = rule.clientWidth || 1;
        H = rule.clientHeight || 44;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      size();
      window.addEventListener("resize", size, { passive: true });

      let px = -1e4, py = 0;
      rule.addEventListener("pointermove", (e) => {
        const r = rule.getBoundingClientRect();
        px = e.clientX - r.left;
        py = e.clientY - r.top;
      }, { passive: true });
      rule.addEventListener("pointerleave", () => { px = -1e4; });

      let t = 0, last = performance.now();
      function frame(now) {
        requestAnimationFrame(frame);
        if (document.hidden) { last = now; return; }
        const dt = Math.min((now - last) / 1000, 0.033);
        last = now;
        t += dt;
        const mid = H / 2;
        if (px > -9000) {
          const ci = Math.round((px / W) * (N - 1));
          for (let o = -8; o <= 8; o++) {
            const i = ci + o;
            if (i < 1 || i >= N - 1) continue;
            const w = 1 - Math.abs(o) / 8;
            v[i] += ((py - mid) * 0.9 - y[i]) * w * 0.16;
          }
        }
        for (let i = 1; i < N - 1; i++) v[i] += (y[i - 1] + y[i + 1] - 2 * y[i]) * 0.4 - y[i] * 0.02;
        for (let i = 1; i < N - 1; i++) { v[i] *= 0.96; y[i] += v[i]; }
        ctx.clearRect(0, 0, W, H);
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const X = (i / (N - 1)) * W;
          const Y = mid + y[i] + Math.sin(X * 0.01 + t * 1.2) * 1.2;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        }
        ctx.strokeStyle = tint;
        ctx.globalAlpha = 0.16;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(237, 235, 230, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    });
  }

  /* ── music page: feature video sound toggle ───────────────────────────── */

  function initYtSound() {
    const btn = document.querySelector("[data-yt-sound]");
    const iframe = document.getElementById("yt-feature-player");
    if (!btn || !iframe) return;
    const send = (func, args = []) =>
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
    let on = false;
    btn.addEventListener("click", () => {
      on = !on;
      send(on ? "unMute" : "mute");
      if (on) send("setVolume", [100]);
      btn.textContent = on ? "[ Sound: On ]" : "[ Sound: Off ]";
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  /* ── home background: interactive three.js artwork ────────────────────── */

  // Loads the noise-terrain sketch behind the patch. Skipped under
  // prefers-reduced-motion, which leaves the still, dark background instead.
  function initHomeArt() {
    const frame = document.querySelector("[data-art-bg]");
    if (!frame) return;
    if (reducedMotion) return;
    frame.src = frame.dataset.artBg;
  }

  // mute/unmute the artwork's generative audio. The field-click starts sound
  // by default (unmuted); this button silences it, and — clicking to unmute —
  // also starts the audio if it hasn't begun yet.
  function initArtMute() {
    const btn = document.querySelector("[data-art-mute]");
    const frame = document.querySelector("[data-art-bg]");
    if (!btn || !frame) return;
    const api = () => {
      try { return frame.contentWindow && frame.contentWindow.__audioAPI; } catch (e) { return null; }
    };
    const tone = () => {
      try { return frame.contentWindow && frame.contentWindow.Tone; } catch (e) { return null; }
    };
    // the icon reflects whether sound is actually audible right now
    const audible = () => {
      const a = api(), T = tone();
      return !!(a && a.ready && T && T.Destination && !T.Destination.mute);
    };
    function render() {
      const on = audible();
      btn.classList.toggle("is-muted", !on);
      btn.setAttribute("aria-pressed", String(!on));
    }

    btn.addEventListener("click", () => {
      const a = api();
      if (!a) return;
      if (!a.ready) {
        a.start();          // first click starts the sound, just like the field
        a.setMuted(false);
      } else {
        const T = tone();
        a.setMuted(!(T && T.Destination && T.Destination.mute)); // toggle
      }
      setTimeout(render, 60);
    });

    // keep the icon honest if sound is started/stopped elsewhere (field click)
    setInterval(render, 700);
    render();
  }

  /* ── home background: random rotation of background films (parked) ─────── */

  // A muted Vimeo film plays behind the patch; when it ends, another one is
  // picked at random. Currently dormant — no [data-vimeo-bg] frames exist, so
  // this self-disables. Kept for a possible revert from the artwork.
  const HOME_BG_IDS = ["1206997431", "1206997805", "1206998214"];

  function initHomeBgSwap() {
    const frames = Array.from(document.querySelectorAll("[data-vimeo-bg]"));
    if (!frames.length) return;
    if (reducedMotion) return; // leave the still, dark background

    const bgUrl = (id) => `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&dnt=1`;
    const pick = (not) => {
      let n = HOME_BG_IDS[(Math.random() * HOME_BG_IDS.length) | 0];
      while (n === not && HOME_BG_IDS.length > 1) {
        n = HOME_BG_IDS[(Math.random() * HOME_BG_IDS.length) | 0];
      }
      return n;
    };

    let cur = pick(null);
    frames[0].src = bgUrl(cur);
    frames[0].classList.add("is-live");

    // Without the API (or a second frame) the current film simply loops.
    // With it, a standby player preloads the next film and crossfades in
    // just before the active one ends — a seamless rotation.
    if (frames.length < 2 || typeof window.Vimeo === "undefined" || !window.Vimeo.Player) return;
    try {
      let next = pick(cur);
      frames[1].src = bgUrl(next);
      const players = frames.slice(0, 2).map((f) => new Vimeo.Player(f));
      players.forEach((p) => p.setLoop(false).catch(() => {}));
      players[1].ready().then(() => players[1].pause().catch(() => {})).catch(() => {});

      let act = 0;
      let swapping = false;

      function beginSwap() {
        if (swapping) return;
        swapping = true;
        const standby = 1 - act;
        players[standby].play().catch(() => {});
        frames[standby].classList.add("is-live");
        frames[act].classList.remove("is-live");
        const old = act;
        act = standby;
        cur = next;
        // once the fade is over, retire the old player and preload another
        setTimeout(() => {
          players[old].pause().catch(() => {});
          next = pick(cur);
          players[old]
            .loadVideo(next)
            .then(() => {
              players[old].setLoop(false).catch(() => {});
              players[old].pause().catch(() => {});
            })
            .catch(() => {});
          swapping = false;
        }, 1500);
      }

      players.forEach((p, i) => {
        p.on("timeupdate", (d) => {
          if (i !== act || swapping) return;
          if (d.duration && d.duration - d.seconds < 1.2) beginSwap();
        });
        p.on("ended", () => {
          if (i === act) beginSwap();
        });
      });
    } catch (err) {}
  }

  /* ── music page: chrome-less autoplay embeds with sound chips ─────────── */

  function initYtHover() {
    document.querySelectorAll("[data-yt-hover]").forEach((frame) => {
      const iframe = frame.querySelector("iframe");
      const btn = frame.querySelector("[data-yt-hover-sound]");
      if (!iframe || !btn) return;
      const send = (func, args = []) =>
        iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
      let on = false;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        on = !on;
        send(on ? "unMute" : "mute");
        if (on) {
          send("setVolume", [100]);
          send("playVideo");
        }
        btn.textContent = on ? "[ On ]" : "[ Off ]";
        btn.setAttribute("aria-pressed", String(on));
      });
    });
  }

  /* ── page background video (MOPs) ─────────────────────────────────────── */

  function initBgVideo() {
    document.querySelectorAll(".page-bgvid video").forEach((v) => {
      if (reducedMotion) {
        v.removeAttribute("autoplay");
        v.pause();
      }
    });
  }

  /* ── hero background: pause when off-screen ────────────────────────────── */

  function initHeroBg() {
    const bg = document.querySelector(".hero-bg");
    const hero = document.querySelector(".hero");
    if (!bg || !hero) return;
    // The embedded sketch is GPU/CPU-heavy and runs every frame. Hiding its
    // container (display:none) makes the browser pause the iframe's render
    // loop, so it stops taxing the main thread once you scroll past the hero.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          bg.style.display = e.isIntersecting ? "" : "none";
        });
      },
      { threshold: 0 }
    );
    io.observe(hero);
  }

  /* ── go ───────────────────────────────────────────────────────────────── */

  initGalleries();
  initVisHeroBg();
  initVisVideoGallery();
  initVisStillImages();
  initCoverPosters();
  initWorkToggles();
  initDocsAccordion();
  initCursor();
  initMagnetic();
  initTilt();
  initFooter();
  initHud();
  initScramble();
  initModules();
  initSignalMenu();
  initRuleStrings();
  initYtSound();
  initYtHover();
  initHomeArt();
  initArtMute();
  initHomeBgSwap();
  initBgVideo();
  initHeroBg();
  boot();
})();
