/* Ballast — site behaviour. No libraries. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover)").matches;
  if (!reduce) doc.classList.add("js-motion");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var onView = function (el, cb, opts) {
    if (!("IntersectionObserver" in window)) { cb(true); return null; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.isIntersecting, e); }); }, opts || { threshold: 0.15 });
    io.observe(el);
    return io;
  };

  /* ---------- dawn intro: once per session, never with reduced motion ---------- */
  var dawn = $(".dawn");
  if (dawn) {
    var seen = false;
    try { seen = sessionStorage.getItem("ballast-dawn") === "1"; } catch (e) {}
    if (reduce || seen) { dawn.remove(); }
    else {
      try { sessionStorage.setItem("ballast-dawn", "1"); } catch (e) {}
      setTimeout(function () { dawn.classList.add("is-rising"); }, 260);
      setTimeout(function () { dawn.remove(); }, 1100);
    }
  }

  /* ---------- header collapse ---------- */
  var onScroll = function () { doc.classList.toggle("is-scrolled", window.scrollY > 24); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var mBtn = $(".menu-btn"), mPanel = $(".menu-panel");
  if (mBtn && mPanel) {
    var setMenu = function (open) {
      mBtn.setAttribute("aria-expanded", String(open));
      mBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mPanel.classList.toggle("is-open", open);
      if (open) { var f = mPanel.querySelector("a"); if (f) f.focus(); }
    };
    mBtn.addEventListener("click", function () { setMenu(mBtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mBtn.getAttribute("aria-expanded") === "true") { setMenu(false); mBtn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (mBtn.getAttribute("aria-expanded") === "true" && !mPanel.contains(e.target) && !mBtn.contains(e.target)) setMenu(false);
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- theme zones: a zone (or its group) turns to night as it crosses mid-screen ---------- */
  var zones = $$("[data-zone='dark']");
  if (zones.length && "IntersectionObserver" in window) {
    var active = new Set();
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) active.add(e.target); else active.delete(e.target); });
      var real = true;
      var groups = new Set();
      active.forEach(function (z) { groups.add(z.dataset.zoneGroup || z); });
      zones.forEach(function (z) { z.classList.toggle("is-dark", real && groups.has(z.dataset.zoneGroup || z)); });
      if (real && active.size) body.dataset.theme = "dark"; else delete body.dataset.theme;
    }, { rootMargin: "-50% 0px -50% 0px" });
    zones.forEach(function (z) { zio.observe(z); });
  }
  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add("theme-ready"); }); });

  /* ---------- headline reveal (water-level lines) ---------- */
  var canMask = window.CSS && CSS.supports && typeof CSS.registerProperty === "function" &&
    (CSS.supports("mask-composite", "intersect") || CSS.supports("-webkit-mask-composite", "source-in"));
  if (!reduce && canMask) {
    $$("[data-reveal]").forEach(function (el) {
      var r = el.getBoundingClientRect();
      var inFirstView = r.top < window.innerHeight && r.bottom > 0;
      // headings stay whole until the moment they reveal, so nothing is ever left hidden
      var play = function () {
        el.classList.add("rv-armed", "rv-play");
        setTimeout(function () { el.classList.add("rv-done"); el.classList.remove("rv-armed", "rv-play"); }, 1350);
      };
      if (inFirstView) { el.classList.add("rv-armed"); setTimeout(play, dawn && dawn.isConnected ? 700 : 120); return; }
      var io = onView(el, function (vis) { if (vis) { io && io.disconnect(); play(); } }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    });
  }

  /* ---------- product film ---------- */
  var film = $(".film");
  if (film) {
    var stage = film.closest(".hero__stage");
    var fit = function () {
      film.style.setProperty("--s", (film.clientWidth / 1280).toFixed(4));
      // below 900 px the bar controls shrink to a few pixels: keep them out of the tab order (the pause button stays)
      var small = film.clientWidth < 900;
      $$(".film__status, .film__dots button", film).forEach(function (b) { b.tabIndex = small ? -1 : 0; });
    };
    fit();
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(film); else window.addEventListener("resize", fit);
    if (stage && finePointer) {
      stage.addEventListener("pointermove", function (e) {
        var b = stage.getBoundingClientRect();
        stage.style.setProperty("--mx", (e.clientX - b.left + 40) + "px");
        stage.style.setProperty("--my", (e.clientY - b.top + 40) + "px");
      });
    }
    var scenes = $$(".scene", film), dots = $$(".film__dots i", film), dotBtns = $$(".film__dots button", film);
    var status = $(".film__status", film), menu = $(".film__menu", film), msgs = $$(".side__msg", film);
    var evs = $$(".ev", film), chain = $(".chain", film), approve = $(".ubtn--p", film);
    var checks = $$(".check", film), checksEnd = $(".checks__end", film);
    var tl = $$(".tl li", film), bars = $(".p99__bars", film), p99v = $(".p99__v", film);
    // p99 latency, one bar per 30 s from 03:05: quiet, the climb after the deploy, the fall after the fix
    var CUT = [16, 24, 29, 34, 40], TLI = [1, 2, 3, 3, 4];
    if (bars) [.3, .3, .32, .3, .31, .3, .3, .32, .3, .3, .35, .6, .85, .95, .96, .95, .97, .95, .96, .95, .97, .96, .95, .96, .95, .97, .96, .95, .96, .5, .36, .33, .32, .31, .32, .3, .31, .32, .3, .31].forEach(function (h) {
      var b = document.createElement("i"); b.style.setProperty("--h", h); bars.appendChild(b);
    });
    var barEls = bars ? $$("i", bars) : [];
    var STAT = [["Paging", "red"], ["Investigating", "brass"], ["Fix ready", "brass"], ["Verifying", "green"], ["Resolved", "green"]];
    var show = function (i) {
      scenes.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      dots.forEach(function (d, k) { d.classList.toggle("on", k <= i); });
      status.firstChild.nodeValue = STAT[i][0]; film.dataset.tone = STAT[i][1];
      msgs.forEach(function (m, k) { m.classList.toggle("on", k <= i); m.classList.toggle("now", k === i); });
      tl.forEach(function (li, k) { li.classList.toggle("on", k <= TLI[i]); });
      barEls.forEach(function (b, k) { b.classList.toggle("off", k >= CUT[i]); });
      if (p99v) p99v.textContent = i >= 3 ? "0.9 s" : "2.6 s";
    };
    var resetAll = function () {
      evs.forEach(function (e) { e.classList.remove("on"); });
      chain.classList.remove("on"); approve.classList.remove("pressed");
      checks.forEach(function (c) { c.classList.remove("ok"); }); checksEnd.classList.remove("on");
    };
    var settle = function (i) { // a scene shown whole, as if its beats had played
      resetAll();
      if (i >= 1) { evs.forEach(function (e) { e.classList.add("on"); }); chain.classList.add("on"); }
      if (i >= 2) approve.classList.toggle("pressed", i > 2);
      if (i >= 3) { checks.forEach(function (c) { c.classList.add("ok"); }); checksEnd.classList.add("on"); }
      show(i);
    };
    var run = 0, visible = true;
    var waitVisible = function () { return new Promise(function (r) { (function chk() { visible ? r() : setTimeout(chk, 300); })(); }); };
    var loop = async function (delay) {
      var id = ++run;
      var t = async function (ms) { await sleep(ms); await waitVisible(); if (id !== run) throw 0; };
      try {
        await t(delay);
        for (;;) {
          resetAll(); show(0); await t(2000);
          show(1);
          for (var i = 0; i < evs.length; i++) { await t(i === 0 ? 150 : 500); evs[i].classList.add("on"); }
          await t(400); chain.classList.add("on"); await t(450);
          show(2); await t(2000); approve.classList.add("pressed"); await t(500);
          show(3);
          for (var j = 0; j < checks.length; j++) { await t(450); checks[j].classList.add("ok"); }
          await t(350); checksEnd.classList.add("on"); await t(350);
          show(4); await t(3000);
        }
      } catch (e) { /* stopped by a manual pick */ }
    };
    // a manual pick holds the film on that scene; the pause button then reads Play and resumes the loop
    var jump = function (i) { run++; settle(i); if (!reduce) setFilmPaused(true); };
    var setFilmMenu = function (open) {
      status.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      film.classList.toggle("menu-open", open);
    };
    status.addEventListener("click", function (e) { e.stopPropagation(); setFilmMenu(menu.hidden); });
    $$("button", menu).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.step;
        setNote(-1);
        if (k === "play") { setFilmPaused(false); loop(0); } else jump(+k);
        setFilmMenu(false); status.focus();
      });
    });
    var note = $(".film__note", film);
    var NOTES = msgs.map(function (m) { return m.lastChild.nodeValue.trim(); });
    var setNote = function (k) {
      dotBtns.forEach(function (b, n) { b.setAttribute("aria-expanded", String(n === k)); });
      if (k < 0) { note.hidden = true; return; }
      note.innerHTML = "<b></b> ";
      note.firstChild.textContent = STAT[k][0];
      note.appendChild(document.createTextNode(NOTES[k] || ""));
      note.hidden = false;
    };
    dotBtns.forEach(function (b, k) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = b.getAttribute("aria-expanded") === "true";
        jump(k); setNote(open ? -1 : k);
      });
    });
    document.addEventListener("click", function (e) { if (!note.hidden && !note.contains(e.target)) setNote(-1); });
    document.addEventListener("click", function (e) { if (!menu.hidden && !menu.contains(e.target)) setFilmMenu(false); });
    film.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setFilmMenu(false); status.focus(); } });
    var fp = $(".film__pause");
    var setFilmPaused = function (p) {
      if (!fp) return;
      fp.setAttribute("aria-pressed", String(p));
      if (stage) stage.classList.toggle("is-paused", p);
      $(".pb-label", fp).textContent = p ? "Play" : "Pause";
    };
    if (fp) {
      if (reduce) fp.hidden = true;
      fp.addEventListener("click", function () {
        var p = fp.getAttribute("aria-pressed") !== "true";
        setFilmPaused(p);
        if (p) run++; else loop(0);
      });
    }
    if (reduce) { settle(4); }
    else {
      var started = false;
      onView(film, function (v) { visible = v; if (v && !started) { started = true; loop(dawn && dawn.isConnected ? 1400 : 600); } }, { threshold: 0.05 });
    }
  }

  /* ---------- counters: the real figure shows until the number scrolls into view ---------- */
  $$("[data-count]").forEach(function (el) {
    var to = parseFloat(el.dataset.count);
    if (reduce) return;
    var io = onView(el, function (v) {
      if (!v) return; io && io.disconnect();
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / 1150), e = 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(to * (p === 1 ? 1 : e));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.5 });
  });

  /* ---------- auto-advancing selectors (agents, ways to work) ---------- */
  function autoTabs(root, tabSel, barSel, onSelect) {
    if (!root) return;
    var tabs = $$(tabSel, root), idx = 0, paused = reduce, held = false, timer = null;
    var pauseBtn = $(".pausebtn", root);
    var select = function (i, user) {
      idx = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        var on = k === idx;
        t.setAttribute("aria-pressed", String(on));
        var bar = $(barSel, t);
        if (bar) { bar.classList.remove("run"); if (on && !paused) { void bar.offsetWidth; bar.classList.add("run"); } }
      });
      onSelect(idx, user);
    };
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { select(k, true); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (d) { e.preventDefault(); select(idx + d, true); tabs[idx].focus(); }
      });
      var bar = $(barSel, t);
      if (bar) bar.addEventListener("animationend", function () { if (!paused && !held) select(idx + 1); });
    });
    root.addEventListener("pointerenter", function () { held = true; root.classList.add("is-held"); });
    root.addEventListener("pointerleave", function () { held = false; root.classList.remove("is-held"); });
    root.addEventListener("focusin", function () { held = true; root.classList.add("is-held"); });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget)) { held = false; root.classList.remove("is-held"); } });
    var setPaused = function (p) {
      paused = p; root.classList.toggle("is-paused", p);
      if (pauseBtn) { pauseBtn.setAttribute("aria-pressed", String(p)); var l = $(".pb-label", pauseBtn); if (l) l.textContent = p ? "Play" : "Pause"; }
      select(idx);
    };
    if (pauseBtn) pauseBtn.addEventListener("click", function () { setPaused(!paused); });
    // only run while on screen
    onView(root, function (v) { if (!v) { root.classList.add("is-held"); } else if (!held) { root.classList.remove("is-held"); } }, { threshold: 0.1 });
    setPaused(paused);
  }

  var agents = $("[data-agents]");
  if (agents) {
    var detail = $(".detail", agents), tabList = $(".tabs", agents), body2 = $(".agents__body", agents) || agents;
    var panes = $$(".detail__pane", agents), dHead = $(".detail__name", agents), dIcon = $(".detail__icon", agents);
    var dCount = $(".detail__count", agents);
    var mq = window.matchMedia("(max-width: 1023px)");
    var place = function (i) {
      var tabs = $$(".tab", agents);
      if (mq.matches) tabs[i].after(detail); else if (detail.parentNode !== body2) body2.appendChild(detail);
    };
    autoTabs(agents, ".tab", ".tab__bar i", function (i, user) {
      // announce only what the visitor chose, never the 6-second auto-advance
      detail.setAttribute("aria-live", user ? "polite" : "off");
      panes.forEach(function (p, k) { p.hidden = k !== i; });
      var tab = $$(".tab", agents)[i];
      dHead.textContent = $(".tab__name", tab).textContent;
      dIcon.innerHTML = $(".tab__icon", tab).innerHTML;
      if (dCount) dCount.textContent = "Agent " + (i + 1) + " of " + panes.length;
      place(i);
    });
    mq.addEventListener("change", function () { var cur = $$(".tab", agents).findIndex(function (t) { return t.getAttribute("aria-pressed") === "true"; }); place(Math.max(0, cur)); });
    onView(agents, function (v) { if (v) agents.classList.add("is-in"); }, { threshold: 0.2 });
  }

  var ways = $("[data-ways]");
  if (ways) {
    var wtiles = $$(".tile", ways);
    autoTabs(ways, ".wtab", ".wbar i", function (i) { wtiles.forEach(function (t, k) { t.classList.toggle("is-dim", k !== i); }); });
  }

  /* ---------- tile micro-sequences (loop ≈3.5 s while visible) ---------- */
  if (!reduce) {
    $$(".tile [data-seq]").forEach(function (win) {
      var chips = $$(".gchip", win), typing = $(".typing", win), on = false, loopT = null;
      chips.forEach(function (c) { c.classList.add("pre"); });
      var run = async function () {
        while (on) {
          chips.forEach(function (c) { c.classList.add("pre"); });
          if (typing) typing.style.visibility = "visible";
          for (var i = 0; i < chips.length && on; i++) { await sleep(i === chips.length - 1 && typing ? 700 : 260); chips[i].classList.remove("pre"); }
          if (typing) typing.style.visibility = "hidden";
          await sleep(2400);
        }
      };
      onView(win, function (v) { var was = on; on = v; if (v && !was) run(); if (!v) chips.forEach(function (c) { c.classList.remove("pre"); }); }, { threshold: 0.35 });
    });
  }

  /* ---------- drifting rows: log carousel (30 px/s) and careers marquee (35 px/s) ---------- */
  function drift(root, trackSel, speed, setCount) {
    if (!root) return;
    var track = $(trackSel, root); if (!track) return;
    var items = track.children, x = 0, last = 0, paused = reduce, held = false, visible = false, target = null;
    var setW = function () { var n = items.length / setCount; return items[n] ? items[n].offsetLeft - items[0].offsetLeft : 0; };
    var btn = $(".js-pause", root);
    var setPaused = function (p) { paused = p; root.classList.toggle("is-paused", p); if (btn) { btn.setAttribute("aria-pressed", String(p)); btn.setAttribute("aria-label", p ? "Play the moving list" : "Pause the moving list"); } };
    setPaused(paused);
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    root.addEventListener("pointerenter", function () { held = true; });
    root.addEventListener("pointerleave", function () { held = false; });
    root.addEventListener("focusin", function () { held = true; });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget)) held = false; });
    var step = 288;
    $$(".js-prev, .js-next", root).forEach(function (b) {
      b.addEventListener("click", function () { target = (target === null ? x : target) + (b.classList.contains("js-prev") ? step : -step); });
    });
    var frame = function (now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      var w = setW();
      if (target !== null) { var d = target - x; x += d * Math.min(1, dt * 9); if (Math.abs(d) < .5) { x = target; target = null; } }
      else if (!paused && !held) x -= speed * dt;
      if (w) { while (x <= -w) { x += w; if (target !== null) target += w; } while (x > 0) { x -= w; if (target !== null) target -= w; } }
      track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      if (visible) requestAnimationFrame(frame); else last = 0;
    };
    onView(root, function (v) { var was = visible; visible = v; if (v && !was) requestAnimationFrame(frame); }, { threshold: 0 });
  }
  drift($(".logrow"), ".track", 30, 4);
  drift($(".band"), ".marquee__in", 35, 3);

  /* ---------- video modal ---------- */
  var poster = $(".poster"), modal = $("#video-modal");
  if (poster && modal && modal.showModal) {
    poster.addEventListener("click", function () { modal.showModal(); });
    $$("[data-close]", modal).forEach(function (b) { b.addEventListener("click", function () { modal.close(); }); });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });
    modal.addEventListener("close", function () { poster.focus(); });
  }

  /* ---------- deep-water field (canvas 2D, shared, seen through windows) ---------- */
  var wins = $$(".window");
  if (wins.length && !reduce) {
    var base = body.getAttribute("data-base") || "";
    var img = new Image();
    img.decoding = "async";
    img.src = base + "assets/field-caustics.webp";
    var OW = 640, OH = 360;
    var off = document.createElement("canvas"); off.width = OW; off.height = OH;
    var octx = off.getContext("2d");
    var live = new Set(), ptr = null, raf = 0, lastF = 0;
    wins.forEach(function (w) {
      var c = document.createElement("canvas"); c.className = "field"; c.setAttribute("aria-hidden", "true");
      w.prepend(c); w._c = c; w._ctx = c.getContext("2d");
      onView(w, function (v) { if (v) live.add(w); else live.delete(w); if (live.size && !raf) raf = requestAnimationFrame(tick); }, { threshold: 0 });
      if (finePointer) {
        w.addEventListener("pointermove", function (e) {
          var b = w.getBoundingClientRect();
          var px = e.clientX - b.left, py = e.clientY - b.top;
          w.style.setProperty("--mx", px + "px"); w.style.setProperty("--my", py + "px");
          ptr = { w: w, x: px / b.width, y: py / b.height };
        });
        w.addEventListener("pointerleave", function () { if (ptr && ptr.w === w) ptr = null; });
      }
    });
    var paintField = function (t) {
      if (!img.complete || !img.naturalWidth) return false;
      var iw = img.naturalWidth, ih = img.naturalHeight;
      octx.globalCompositeOperation = "source-over"; octx.globalAlpha = 1;
      var sx = (Math.sin(t * 0.05) * 0.5 + 0.5) * iw * 0.25, sy = (Math.cos(t * 0.04) * 0.5 + 0.5) * ih * 0.2;
      octx.drawImage(img, sx, sy, iw * 0.75, ih * 0.8, 0, 0, OW, OH);
      octx.globalCompositeOperation = "screen"; octx.globalAlpha = 0.5;
      var s2 = 0.55 + Math.sin(t * 0.07) * 0.05;
      var sx2 = (Math.cos(t * 0.06 + 1) * 0.5 + 0.5) * iw * (1 - s2), sy2 = (Math.sin(t * 0.05 + 2) * 0.5 + 0.5) * ih * (1 - s2);
      octx.save(); octx.translate(OW, 0); octx.scale(-1, 1);
      octx.drawImage(img, sx2, sy2, iw * s2, ih * s2, 0, 0, OW, OH);
      octx.restore();
      octx.globalCompositeOperation = "source-over"; octx.globalAlpha = 1;
      return true;
    };
    var tick = function (now) {
      raf = 0;
      if (!live.size) return;
      raf = requestAnimationFrame(tick);
      if (now - lastF < 33) return; lastF = now;
      var t = now / 1000;
      if (!paintField(t)) return;
      var vw = window.innerWidth, vh = window.innerHeight;
      live.forEach(function (w) {
        var b = w.getBoundingClientRect(), c = w._c, ctx = w._ctx;
        var cw = Math.max(1, Math.round(b.width * 0.6)), ch = Math.max(1, Math.round(b.height * 0.6));
        if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
        // map the window onto the field as if one sheet of water lay behind the page
        var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };
        var fw = Math.min(OW, OW * 0.55 * (b.width / vw) + OW * 0.25), fh = fw * (b.height / b.width);
        if (fh > OH) { fh = OH; fw = fh * (b.width / b.height); }
        var fx = (OW - fw) * clamp01(b.left / Math.max(1, vw - b.width));
        var fy = (OH - fh) * clamp01((b.top + b.height) / (vh + b.height));
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(off, fx, fy, fw, fh, 0, 0, cw, ch);
        if (ptr && ptr.w === w) {
          var g = ctx.createRadialGradient(ptr.x * cw, ptr.y * ch, 0, ptr.x * cw, ptr.y * ch, 90);
          g.addColorStop(0, "rgba(232,196,128,0.32)"); g.addColorStop(1, "rgba(232,196,128,0)");
          ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
        }
      });
    };
    img.addEventListener("load", function () { if (live.size && !raf) raf = requestAnimationFrame(tick); });
  }

  /* ---------- log archive filter + search ---------- */
  var archive = $("[data-archive]");
  if (archive) {
    var rows = $$(".row", archive), fbtns = $$(".filter", archive), q = $("input[type='search']", archive), empty = $(".empty", archive);
    var cat = "All";
    var apply = function () {
      var term = (q.value || "").trim().toLowerCase(), n = 0;
      rows.forEach(function (r) {
        var ok = (cat === "All" || r.dataset.cat === cat) && (!term || r.dataset.title.toLowerCase().indexOf(term) > -1);
        r.hidden = !ok; if (ok) n++;
      });
      if (n === 0) {
        empty.hidden = false;
        $(".empty__q", empty).textContent = q.value.trim() || cat;
      } else empty.hidden = true;
    };
    fbtns.forEach(function (b) { b.addEventListener("click", function () { cat = b.dataset.cat; fbtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); apply(); }); });
    q.addEventListener("input", apply);
  }

  /* ---------- article table of contents ---------- */
  var toc = $$(".toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var heads = toc.map(function (a) { return document.getElementById(a.hash.slice(1)); }).filter(Boolean);
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) toc.forEach(function (a) { a.classList.toggle("is-active", a.hash.slice(1) === e.target.id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    heads.forEach(function (h) { tio.observe(h); });
  }

  /* ---------- demo form (local only, nothing is sent anywhere) ---------- */
  var form = $("#demo-form");
  if (form) {
    var personal = /@(gmail|googlemail|yahoo|hotmail|outlook|live|icloud|me|aol|proton|protonmail|gmx|mail)\./i;
    var rules = {
      first: function (v) { return v ? "" : "Enter your first name."; },
      last: function (v) { return v ? "" : "Enter your last name."; },
      email: function (v) {
        if (!v) return "Enter your work email.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Check the email address. It should look like name@company.com.";
        if (personal.test(v)) return "Use a work email so we can find your team.";
        return "";
      },
      company: function (v) { return v ? "" : "Enter your company name."; },
      role: function (v) { return v ? "" : "Choose the role closest to yours."; }
    };
    var sum = $(".form__sum", form), banner = $(".banner", form), submit = $(".form__submit", form);
    var success = $("#demo-success");
    var check = function (name) {
      var el = form.elements[name], msg = rules[name]((el.value || "").trim());
      var err = document.getElementById("err-" + name);
      err.textContent = msg;
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) el.setAttribute("aria-describedby", (el.dataset.help ? el.dataset.help + " " : "") + "err-" + name);
      else if (el.dataset.help) el.setAttribute("aria-describedby", el.dataset.help); else el.removeAttribute("aria-describedby");
      return !msg;
    };
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      el.addEventListener("blur", function () { if (el.value || el.getAttribute("aria-invalid")) check(n); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") check(n); });
      el.addEventListener("change", function () { if (el.tagName === "SELECT") check(n); });
    });
    var send = async function () {
      banner.hidden = true;
      submit.disabled = true; var label = submit.textContent; submit.textContent = "Booking your demo…";
      await sleep(1100);
      submit.disabled = false; submit.textContent = label;
      if (/fail/i.test(form.elements.email.value)) { banner.hidden = false; $("button", banner).focus(); return; }
      form.hidden = true; success.hidden = false; $("h2", success).focus();
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).filter(function (n) { return !check(n); });
      if (bad.length) {
        sum.textContent = "Fix " + bad.length + (bad.length === 1 ? " field" : " fields") + " to continue.";
        form.elements[bad[0]].focus();
        return;
      }
      sum.textContent = "";
      send();
    });
    $("button", banner).addEventListener("click", send);
  }
})();
