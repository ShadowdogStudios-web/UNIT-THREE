/* Promise & Practice · Unit 3 — learning supports (read-aloud, word definitions, about panel).
   © 2026 ShadowDog Digital Studios. All Rights Reserved. */
(function () {
  'use strict';
  var TERMS = window.SDS_TERMS || [];
  var PAGE = document.body.getAttribute('data-page') || '';
  var synth = window.speechSynthesis;
  var HL = (window.CSS && CSS.highlights && window.Highlight) ? true : false;

  function dock() { return document.querySelector('.tools-dock'); }
  function lang() { var l = document.documentElement.getAttribute('data-lang') || document.documentElement.lang || 'en'; return l; }
  var VOICE_LANG = { en: 'en-US', es: 'es-US', ml: 'ml-IN' };

  /* ---------- read-aloud with word highlighting ---------- */
  var SKIP = 'script,style,button,.credit,.no-print,.tools-dock,.notes-panel,.term-pop,details:not([open]),figcaption,nav,.deck-bar,.deck-nav,input,textarea,select,[aria-hidden="true"]';
  function target() {
    var s = document.querySelector('.slide.on .sl-in') || document.querySelector('.slide.on');
    return s || document.querySelector('.lp-main') || document.querySelector('main') || document.querySelector('.wrap') || document.body;
  }
  function blocks(root) {
    var out = [];
    root.querySelectorAll('h1,h2,h3,h4,p,li,.ly-line,.dq p,label').forEach(function (el) {
      if (el.closest(SKIP)) return;
      if (el.querySelector('p,li')) return;
      var t = el.textContent.replace(/\s+/g, ' ').trim();
      if (t.length > 1) out.push(el);
    });
    return out;
  }
  function textNodes(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentElement && n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var a = [], n; while ((n = w.nextNode())) a.push(n); return a;
  }
  function rangeAt(nodes, start, len) {
    var pos = 0, r = document.createRange(), set = false;
    for (var i = 0; i < nodes.length; i++) {
      var L = nodes[i].nodeValue.length;
      if (!set && start < pos + L) { r.setStart(nodes[i], start - pos); set = true; }
      if (set && start + len <= pos + L) { r.setEnd(nodes[i], Math.max(start + len - pos, 0)); return r; }
      pos += L;
    }
    return set ? r : null;
  }
  var reading = null;
  function clearHL() { if (HL) CSS.highlights.delete('sds-read'); document.querySelectorAll('.reading-now').forEach(function (e) { e.classList.remove('reading-now'); }); }
  function stopRead() { if (synth) synth.cancel(); if (reading && reading.audio) { reading.audio.pause(); } reading = null; clearHL(); setBar(false); }
  function pickVoice() {
    var want = VOICE_LANG[lang()] || 'en-US', vs = synth.getVoices();
    return vs.find(function (v) { return v.lang === want; }) || vs.find(function (v) { return v.lang.indexOf(want.slice(0, 2)) === 0; }) || null;
  }
  function readFrom(list, i) {
    if (!reading || i >= list.length) { stopRead(); return; }
    var el = list[i], nodes = textNodes(el), text = nodes.map(function (n) { return n.nodeValue; }).join('');
    clearHL(); el.classList.add('reading-now');
    try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice(); if (v) u.voice = v; u.lang = (v && v.lang) || VOICE_LANG[lang()] || 'en-US';
    u.rate = reading.rate;
    u.onboundary = function (e) {
      if (!HL || e.name && e.name !== 'word') return;
      var m = text.slice(e.charIndex).match(/^[^\s]+/); if (!m) return;
      var r = rangeAt(nodes, e.charIndex, (e.charLength || m[0].length)); if (r) CSS.highlights.set('sds-read', new Highlight(r));
    };
    u.onend = function () { if (reading && !reading.paused) readFrom(list, i + 1); };
    u.onerror = function () { if (reading) readFrom(list, i + 1); };
    reading.i = i; synth.speak(u);
  }
  function startRead() {
    stopRead();
    var root = target(), narr = root.closest('[data-narr]') || root.querySelector('[data-narr]');
    if (narr) {  // recorded narration (e.g. ElevenLabs) — used automatically when a file is attached
      var a = new Audio(narr.getAttribute('data-narr')); reading = { audio: a }; a.onended = stopRead; a.play().catch(stopRead); setBar(true); return;
    }
    if (!synth) { alert('Read-aloud is not available in this browser. Try Chrome.'); return; }
    if (!synth.getVoices().length) { setTimeout(function () { if (!synth.getVoices().length) alert('No reading voice is installed on this device yet. On a Chromebook, open Settings → Accessibility → Text-to-Speech to add one.'); }, 600); }
    var list = blocks(root); if (!list.length) return;
    reading = { rate: parseFloat(localStore('sds_read_rate') || '1'), paused: false, list: list };
    setBar(true); readFrom(list, 0);
  }
  function localStore(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var bar;
  function setBar(on) {
    if (!bar) return;
    bar.hidden = !on;
    var b = document.querySelector('[data-act="read"]'); if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function buildBar() {
    bar = document.createElement('div'); bar.className = 'read-bar no-print'; bar.hidden = true; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Read aloud controls');
    bar.innerHTML = '<span class="rb-t">Reading aloud</span><button type="button" class="btn" data-r="pause">Pause</button><button type="button" class="btn" data-r="stop">Stop</button>' +
      '<label>Speed <select data-r="rate"><option value="0.8">Slow</option><option value="1">Normal</option><option value="1.2">Fast</option></select></label>';
    document.body.appendChild(bar);
    var sel = bar.querySelector('select'); sel.value = localStore('sds_read_rate') || '1';
    sel.onchange = function () { localStore('sds_read_rate', sel.value); if (reading && reading.list) { reading.rate = parseFloat(sel.value); var i = reading.i; synth.cancel(); reading.paused = false; readFrom(reading.list, i); } };
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-r]'); if (!b || !reading) return;
      if (b.dataset.r === 'stop') stopRead();
      if (b.dataset.r === 'pause') {
        if (reading.audio) { if (reading.audio.paused) { reading.audio.play(); b.textContent = 'Pause'; } else { reading.audio.pause(); b.textContent = 'Resume'; } return; }
        if (synth.paused) { synth.resume(); reading.paused = false; b.textContent = 'Pause'; } else { synth.pause(); reading.paused = true; b.textContent = 'Resume'; }
      }
    });
    document.addEventListener('sds:slide', stopRead);
    window.addEventListener('hashchange', stopRead);
    window.addEventListener('pagehide', stopRead);
  }

  /* ---------- click-a-word definitions ---------- */
  var NO_TERMS = /^u3-quiz|^u3-lessons|^u3-teacher/;
  var TSKIP = 'a,button,mark,h1,h2,h3,label,summary,.credit,.lbl,.kicker,.sl-kick,.tools-dock,.notes-panel,.term-pop,.no-print,input,textarea,select,.terms-list,.ly-body,.vocab,script,style';
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function markTerms() {
    if (!TERMS.length || NO_TERMS.test(PAGE) || lang() !== 'en') return;
    var sorted = TERMS.slice().sort(function (a, b) { return b.t.length - a.t.length; });
    var scopes = document.querySelectorAll('.slide, [data-hl], .film-body, .wk-film');
    if (!scopes.length) scopes = [document.querySelector('main') || document.body];
    Array.prototype.forEach.call(scopes, function (scope) {
      if (scope.closest('.slide') && scope !== scope.closest('.slide') && scopes.length > 1 && scope.matches('[data-hl]')) { /* slide handles it */ }
      var used = {};
      sorted.forEach(function (term) {
        if (used[term.t.toLowerCase()]) return;
        var re = new RegExp('\\b(' + esc(term.t) + ')\\b', 'i');
        var w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentElement.closest(TSKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
        var n;
        while ((n = w.nextNode())) {
          var m = re.exec(n.nodeValue); if (!m) continue;
          var after = n.splitText(m.index); after.splitText(m[1].length);
          var b = document.createElement('button'); b.type = 'button'; b.className = 'term-def'; b.setAttribute('data-term', term.t); b.setAttribute('aria-label', m[1] + ' — show definition');
          after.parentNode.insertBefore(b, after); b.appendChild(after);
          used[term.t.toLowerCase()] = 1; break;
        }
      });
    });
  }
  var pop;
  function showDef(btn) {
    var t = TERMS.find(function (x) { return x.t === btn.getAttribute('data-term'); }); if (!t) return;
    if (!pop) { pop = document.createElement('div'); pop.className = 'term-pop'; pop.setAttribute('role', 'dialog'); document.body.appendChild(pop); }
    pop.innerHTML = '<strong>' + t.t + '</strong><p>' + t.d + '</p><div class="tp-act"><button type="button" class="btn" data-tp="say">🔊 Read it</button><a class="btn" href="' + (document.body.getAttribute('data-root') || '') + 'terms.html#' + t.id + '">Key terms</a><button type="button" class="btn" data-tp="x">Close</button></div>';
    var r = btn.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(window.innerWidth - 330, r.left)) + 'px'; pop.style.top = (window.scrollY + r.bottom + 6) + 'px'; pop.hidden = false;
    pop.querySelector('[data-tp="x"]').onclick = function () { pop.hidden = true; btn.focus(); };
    pop.querySelector('[data-tp="say"]').onclick = function () { if (!synth) return; synth.cancel(); var u = new SpeechSynthesisUtterance(t.t + '. ' + t.d); var v = pickVoice(); if (v) u.voice = v; synth.speak(u); };
    pop.querySelector('[data-tp="say"]').focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.term-def');
    if (b) { if (document.documentElement.classList.contains('hl-on')) return; e.preventDefault(); showDef(b); return; }
    if (pop && !pop.hidden && !e.target.closest('.term-pop')) pop.hidden = true;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (pop) pop.hidden = true; } });

  /* ---------- about these supports (UDL) ---------- */
  function about() {
    var d = document.createElement('div'); d.className = 'about-pop no-print'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'About these supports');
    d.innerHTML = '<div class="ab-in"><span class="kicker">About this adaptation</span><h2>Supports built into Unit 3</h2>' +
      '<p>Every page is designed with <strong>Universal Design for Learning (UDL)</strong>: more than one way to take in the content, more than one way to show what you know, and choices that keep you interested.</p>' +
      '<h3>Ways to take in the content</h3><ul><li><strong>🔊 Read aloud</strong> reads the page or slide and lights up each word as it is spoken. Choose slow, normal, or fast.</li>' +
      '<li><strong>Dotted words</strong> are key terms. Click one for a plain-language definition you can also hear.</li>' +
      '<li>Every idea comes with pictures, primary sources, music, or film, each with a caption.</li><li>Song tiles have a lyrics drop-down.</li></ul>' +
      '<h3>Ways to show what you know</h3><ul><li><strong>Highlighter</strong> and <strong>My Notes</strong> save on this device.</li><li>Questions use plain words with <strong>sentence starters</strong>.</li>' +
      '<li>Your answers <strong>save as you type</strong>; you can download, restore, or print them. Paper copies are available from your teacher.</li></ul>' +
      '<h3>Choices</h3><ul><li>Pick a deep dive, a film, or the book. Move at your own pace with the arrows, dots, keyboard, or swipe.</li></ul>' +
      '<p class="ab-k">Keyboard: ← → move between slides · Esc closes pop-ups.</p><button type="button" class="btn primary" data-ab="x">Close</button></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-ab="x"]')) d.remove(); });
    d.querySelector('[data-ab="x"]').focus();
  }

  function init() {
    var dk = dock();
    if (dk) {
      var rb = document.createElement('button'); rb.type = 'button'; rb.className = 'btn'; rb.setAttribute('data-act', 'read'); rb.setAttribute('aria-pressed', 'false'); rb.textContent = '🔊 Read aloud';
      rb.onclick = function () { if (reading) stopRead(); else startRead(); };
      var ab = document.createElement('button'); ab.type = 'button'; ab.className = 'btn ab-btn'; ab.textContent = 'ⓘ Supports'; ab.setAttribute('aria-label', 'About these supports'); ab.onclick = about;
      dk.insertBefore(rb, dk.firstChild.nextSibling); dk.appendChild(ab);
      buildBar();
    }
    setTimeout(markTerms, 60);
    if (synth) { synth.getVoices(); synth.onvoiceschanged = function () {}; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.SDSAccess = { read: startRead, stop: stopRead, markTerms: markTerms };
})();
