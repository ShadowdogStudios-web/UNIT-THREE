/* Promise & Practice · Unit 3 — slideshow engine (works like the Unit 2 decks).
   © 2026 ShadowDog Digital Studios. All Rights Reserved. */
(function () {
  'use strict';
  var deck = document.querySelector('.deck'); if (!deck) return;
  var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
  var n = slides.length, cur = 0;
  var KEY = 'sds_deck_' + deck.getAttribute('data-deck');
  var counter = document.querySelector('.deck-bar .count');
  var dots = deck.querySelector('.dots'), prev = deck.querySelector('[data-go=prev]'), next = deck.querySelector('[data-go=next]');
  slides.forEach(function (s, i) {
    var b = document.createElement('button'); b.type = 'button';
    b.setAttribute('aria-label', 'Slide ' + (i + 1) + ': ' + (s.getAttribute('data-title') || ''));
    b.addEventListener('click', function () { go(i); }); dots.appendChild(b);
  });
  function pad(x) { return (x < 10 ? '0' : '') + x; }
  function go(i, noScroll) {
    cur = Math.max(0, Math.min(n - 1, i));
    slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
    try { document.dispatchEvent(new CustomEvent('sds:slide', { detail: cur })); } catch (e) {}
    dots.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    if (counter) counter.textContent = pad(cur + 1) + ' / ' + pad(n);
    prev.disabled = cur === 0; next.disabled = cur === n - 1;
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
    if (window.SDS) SDS.store(KEY, String(cur));
    if (!noScroll) { var top = deck.getBoundingClientRect().top + window.scrollY - 60; if (window.scrollY > top) window.scrollTo({ top: top }); }
    slides.forEach(function (s, k) { if (k !== cur) s.querySelectorAll('audio').forEach(function (a) { a.pause(); }); });
  }
  prev.addEventListener('click', function () { go(cur - 1); });
  next.addEventListener('click', function () { go(cur + 1); });
  deck.querySelectorAll('[data-go=next-slide]').forEach(function (b) { b.addEventListener('click', function () { go(cur + 1); }); });
  document.addEventListener('keydown', function (e) {
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (document.querySelector('.notes-panel.open') && document.activeElement && document.activeElement.closest('.notes-panel')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(cur + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(cur - 1); }
    if (e.key === 'Home') go(0); if (e.key === 'End') go(n - 1);
  });
  var sx = null, sy = null;
  deck.addEventListener('touchstart', function (e) { if (window.getSelection && String(getSelection())) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  deck.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6 && !String(getSelection())) go(cur + (dx < 0 ? 1 : -1));
  });
  // start: #number, #element-id, or last position
  var h = decodeURIComponent(location.hash.slice(1)), start = 0;
  if (/^\d+$/.test(h)) start = +h - 1;
  else if (h) { var el = document.getElementById(h); var s = el && el.closest('.slide'); if (s) start = slides.indexOf(s); }
  else if (window.SDS) { var saved = +(SDS.store(KEY) || 0); if (saved > 0 && saved < n) start = saved; }
  go(start, true);
  window.addEventListener('hashchange', function () {
    var v = decodeURIComponent(location.hash.slice(1));
    if (/^\d+$/.test(v)) { if (+v - 1 !== cur) go(+v - 1); return; }
    var el = v && document.getElementById(v), s = el && el.closest('.slide'); if (s) go(slides.indexOf(s));
  });

  /* audio players */
  function fmt(t) { if (!isFinite(t)) return '0:00'; var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
  deck.querySelectorAll('.player').forEach(function (p) {
    var a = p.querySelector('audio'), b = p.querySelector('button'), bar = p.querySelector('.bar'), fill = bar.querySelector('span'), tm = p.querySelector('time');
    var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>', PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
    b.innerHTML = PLAY;
    b.addEventListener('click', function () { if (a.paused) { document.querySelectorAll('audio').forEach(function (o) { if (o !== a) o.pause(); }); a.play(); } else a.pause(); });
    a.addEventListener('play', function () { b.innerHTML = PAUSE; b.setAttribute('aria-label', 'Pause'); });
    a.addEventListener('pause', function () { b.innerHTML = PLAY; b.setAttribute('aria-label', 'Play'); });
    a.addEventListener('timeupdate', function () { fill.style.width = (a.currentTime / (a.duration || 1) * 100) + '%'; tm.textContent = fmt(a.currentTime) + ' / ' + fmt(a.duration); });
    a.addEventListener('loadedmetadata', function () { tm.textContent = '0:00 / ' + fmt(a.duration); });
    bar.addEventListener('click', function (e) { var r = bar.getBoundingClientRect(); if (a.duration) a.currentTime = (e.clientX - r.left) / r.width * a.duration; });
  });
})();
