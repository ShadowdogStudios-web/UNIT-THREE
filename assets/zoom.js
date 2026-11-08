/* Promise & Practice · Unit 3 — pop-out image viewer with zoom and pan.
   © 2026 ShadowDog Digital Studios. All Rights Reserved. */
(function () {
  'use strict';
  var SKIP = 'a, button, .lightbox, .film-frame, .tracks, .tools-dock, .notes-panel, .lp-nav, .card, .film-card, .rr-book, header, footer, .zv';
  var list = [], cur = -1, z = 1, tx = 0, ty = 0, MIN = 1, MAX = 6;
  var v, img, cap, cnt, stage, last;

  function eligible(im) {
    if (!im.src || im.closest(SKIP)) return false;
    if ((im.naturalWidth || im.width) < 80 && !im.closest('figure')) return false;
    return true;
  }
  function captionFor(im) {
    var f = im.closest('figure, .wk-fig, .od-person, .sl-media');
    var c = f && f.querySelector('figcaption, .credit');
    if (f && f.classList.contains('od-gal')) {   // gallery: Top/Left/Right credits in one caption
      var imgs = [].slice.call(f.querySelectorAll('img')), k = imgs.indexOf(im), lines = (c ? c.innerText : '').split('\n');
      if (lines[k]) return lines[k].replace(/^(Top|Left|Right):\s*/, '');
    }
    return (c && c.textContent.trim()) || im.alt || '';
  }
  function build() {
    v = document.createElement('div'); v.className = 'zv'; v.hidden = true; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Image viewer');
    v.innerHTML = '<div class="zv-stage"><img alt="" draggable="false"></div>' +
      '<div class="zv-bar"><span class="zv-cnt"></span><p class="zv-cap"></p>' +
      '<div class="zv-btns"><button type="button" data-z="prev" aria-label="Previous image">‹</button><button type="button" data-z="out" aria-label="Zoom out">−</button>' +
      '<button type="button" data-z="reset" aria-label="Fit to screen">Fit</button><button type="button" data-z="in" aria-label="Zoom in">+</button>' +
      '<button type="button" data-z="next" aria-label="Next image">›</button><button type="button" data-z="close" class="zv-x" aria-label="Close">✕ Close</button></div>' +
      '<p class="zv-help">Scroll or pinch to zoom · drag to move · double-click to zoom · ← → for more images · Esc to close</p></div>';
    document.body.appendChild(v);
    stage = v.querySelector('.zv-stage'); img = stage.querySelector('img'); cap = v.querySelector('.zv-cap'); cnt = v.querySelector('.zv-cnt');
    v.querySelector('.zv-btns').addEventListener('click', function (e) {
      var b = e.target.closest('[data-z]'); if (!b) return;
      var a = b.dataset.z;
      if (a === 'close') close(); else if (a === 'next') go(1); else if (a === 'prev') go(-1);
      else if (a === 'in') zoomAt(z * 1.5); else if (a === 'out') zoomAt(z / 1.5); else reset();
    });
    stage.addEventListener('click', function (e) { if (e.target === stage && z === 1) close(); });
    stage.addEventListener('dblclick', function (e) { if (z > 1) reset(); else zoomAt(2.5, e.clientX, e.clientY); });
    stage.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(z * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY); }, { passive: false });
    // drag + pinch with pointer events
    var pts = {}, startD = 0, startZ = 1, drag = null;
    stage.addEventListener('pointerdown', function (e) {
      if (e.target !== img) return;
      stage.setPointerCapture(e.pointerId); pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]]; startD = Math.hypot(a.x - b.x, a.y - b.y); startZ = z; drag = null; }
      else drag = { x: e.clientX - tx, y: e.clientY - ty };
    });
    stage.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2 && startD) { var a = pts[ids[0]], b = pts[ids[1]]; zoomAt(startZ * Math.hypot(a.x - b.x, a.y - b.y) / startD, (a.x + b.x) / 2, (a.y + b.y) / 2); }
      else if (drag && z > 1) { tx = e.clientX - drag.x; ty = e.clientY - drag.y; apply(); }
    });
    function up(e) { delete pts[e.pointerId]; if (Object.keys(pts).length < 2) startD = 0; if (!Object.keys(pts).length) drag = null; }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    // keys: capture so the slideshow does not also move
    window.addEventListener('keydown', function (e) {
      if (!v || v.hidden) return;
      var k = e.key, hit = true;
      if (k === 'Escape') close(); else if (k === 'ArrowRight') go(1); else if (k === 'ArrowLeft') go(-1);
      else if (k === '+' || k === '=') zoomAt(z * 1.5); else if (k === '-') zoomAt(z / 1.5); else if (k === '0') reset();
      else if (k === 'Tab') { trap(e); hit = false; } else hit = false;
      if (hit) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }
  function trap(e) {
    var f = [].slice.call(v.querySelectorAll('button')); var i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { f[f.length - 1].focus(); e.preventDefault(); } else if (!e.shiftKey && i === f.length - 1) { f[0].focus(); e.preventDefault(); }
  }
  function apply() {
    var r = stage.getBoundingClientRect(), w = img.offsetWidth * z, h = img.offsetHeight * z;
    var mx = Math.max(0, (w - r.width) / 2), my = Math.max(0, (h - r.height) / 2);
    tx = Math.min(mx, Math.max(-mx, tx)); ty = Math.min(my, Math.max(-my, ty));
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')';
    img.style.cursor = z > 1 ? 'grab' : 'zoom-in';
    v.querySelector('[data-z="reset"]').textContent = z > 1.01 ? Math.round(z * 100) + '%' : 'Fit';
  }
  function zoomAt(nz, cx, cy) {
    nz = Math.min(MAX, Math.max(MIN, nz));
    var r = stage.getBoundingClientRect();
    if (cx === undefined) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    var ox = cx - (r.left + r.width / 2), oy = cy - (r.top + r.height / 2);
    tx = ox - (ox - tx) * nz / z; ty = oy - (oy - ty) * nz / z; z = nz;
    if (z === 1) { tx = 0; ty = 0; }
    apply();
  }
  function reset() { z = 1; tx = 0; ty = 0; apply(); }
  function show(i) {
    cur = (i + list.length) % list.length; var im = list[cur];
    img.src = im.currentSrc || im.src; img.alt = im.alt || '';
    cap.textContent = captionFor(im);
    cnt.textContent = list.length > 1 ? (cur + 1) + ' / ' + list.length : '';
    v.querySelector('[data-z="prev"]').hidden = v.querySelector('[data-z="next"]').hidden = list.length < 2;
    reset();
  }
  function go(d) { if (list.length > 1) show(cur + d); }
  function open(im) {
    if (!v) build();
    list = [].slice.call(document.querySelectorAll('img')).filter(eligible);
    if (list.indexOf(im) < 0) list = [im];
    last = document.activeElement; v.hidden = false; document.documentElement.classList.add('zv-open');
    show(Math.max(0, list.indexOf(im)));
    v.querySelector('.zv-x').focus();
  }
  function close() { v.hidden = true; document.documentElement.classList.remove('zv-open'); img.removeAttribute('src'); if (last && last.focus) last.focus(); }

  // open on click (not while the highlighter is on)
  document.addEventListener('click', function (e) {
    var im = e.target.closest && e.target.closest('img');
    if (!im || !eligible(im) || document.documentElement.classList.contains('hl-on')) return;
    e.preventDefault(); open(im);
  });
  // mark zoomable images and make them keyboard-reachable
  function mark() {
    document.querySelectorAll('img').forEach(function (im) {
      if (im.dataset.zv || !eligible(im)) return;
      im.dataset.zv = '1'; im.classList.add('zv-able'); im.tabIndex = 0; im.setAttribute('role', 'button');
      im.setAttribute('aria-label', 'Enlarge image: ' + (im.alt || captionFor(im)).slice(0, 120));
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(im); } });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark); else mark();
  window.addEventListener('load', mark);
  // the Image Library's own viewer gets zoom too
  document.addEventListener('click', function (e) {
    var lbImg = e.target.closest && e.target.closest('.lightbox .lb-in img');
    if (lbImg) { e.preventDefault(); open(lbImg); }
  }, true);
  window.SDSZoom = { open: open };
})();
