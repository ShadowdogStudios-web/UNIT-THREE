/* Promise & Practice · Unit 3 — shared page code.
   © 2026 ShadowDog Digital Studios. All Rights Reserved. */
(function () {
  'use strict';
  var LOCK = {"salt": "sds-u3|", "end": "2027-08-30", "windows": [["2026-11-03", ["15add0ea6e7df847c226cbbc", "15949c6a64f257bed813b903", "b5ab20397f931d29a57cef96", "1b32412f3a8e77d071946f9a", "f0cf9d5ca29d38009a461e2b"]], ["2026-12-03", ["98854a8d92d41379c6a21cf7", "bf252eceef44db757e381768", "fafe21afeea99b583a4ada02", "eb8b7890fcea6eddf3bbad00", "263e3b039e0590adb7e4dc1d"]], ["2027-01-02", ["fd5d3ed3c5ef4ae8e6278d58", "5c652d478b429dec7a506b8d", "df281796326ca96cc4d695e1", "7bcc4c3e338b30c09c7b753f", "88d89ea3ec4d4e8a5b5bcba0"]], ["2027-02-01", ["381429b69c1341a05925d157", "91d4b5cd11b3079e02cda63d", "4fee3ee613affda48f6e757e", "d539910364ef37311994e897", "80081833b2c46ca78619f6ef"]], ["2027-03-03", ["fc1efcf573376e6080c6289f", "4f125f5128fab832872cc35b", "a4b47b57ade17b03d490bb7a", "b7f254d9295237950127b43c", "c27043c2b28802b2432ca42f"]], ["2027-04-02", ["3d7c0ec1b4a699b5bedcbe68", "cde1df76dbcb17c9a1b6ee5d", "d6527e206ae62f586af7370e", "92237355a9b235795f8b1472", "b0d5dc172dc03d3b6be928a8"]], ["2027-05-02", ["a6d0e7e4f4a32fd82769c26e", "e3c1e07c087296060af03377", "f434af99e4a50b948490bd29", "fcdd95eefb878bf5a391ecae", "981e2349aa9d2b9bcd54ebef"]], ["2027-06-01", ["676c5e4651e5f806892d1094", "1e94dcc309dc6716dec4169d", "3b689bd53bec8e0dd29d093a", "7123eba6e8a5adf1da3adb15", "df1b5d98c3b833ef1a0725f6"]], ["2027-07-01", ["5218d2e555e1729bbaa4e1a8", "3dda157d88f14fa749c190d4", "52d8782a513885fec7b204f1", "60df522f7d9777493a663133", "ac3b81014175b0c7103e8058"]], ["2027-07-31", ["69a83504720ea47fe903b1b8", "931c8ba5714d9681e0ca7bfa", "b7bd2a76ae83f2b2baa8adb5", "aa8094b55023908b54ec6aeb", "66d0708ae407065bdccff09f"]]], "master": "505260b920fb4b2b7b34dca3", "mv": "505260b9"};
  var SEARCH = window.SDS_SEARCH || [];
  var KEY_UNLOCK = 'sds_site_unlock_v1';
  var PAGE = (document.body && document.body.getAttribute('data-page')) || location.pathname;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- class-code lock ---------- */
  function windowIndex(now) {
    var d = now || new Date(); var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (iso >= LOCK.end) return -1;
    var idx = -1;
    for (var i = 0; i < LOCK.windows.length; i++) if (iso >= LOCK.windows[i][0]) idx = i;
    return idx;
  }
  async function hash(code) {
    var norm = LOCK.salt + String(code).toLowerCase().replace(/\s+/g, '');
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('').slice(0, 24);
  }
  function unlocked() {
    var v = store(KEY_UNLOCK);
    if (!v) return false;
    if (v === 'm:' + LOCK.mv) return true;
    var w = windowIndex();
    return w >= 0 && v === 'w' + w;
  }
  function showLock() {
    var el = document.createElement('div');
    el.id = 'sds-lock';
    el.innerHTML = '<form class="panel" novalidate><span class="kicker">Promise &amp; Practice · Unit 3</span>' +
      '<h1>Enter your class code</h1><p>Your teacher gives each class a code. Type it once on this device and the whole Unit 3 site opens.</p>' +
      '<label class="sr" for="sds-code">Class code</label><input id="sds-code" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Class code">' +
      '<div class="err" role="alert"></div><button class="btn primary" type="submit">Open Unit 3</button>' +
      '<small>© ' + new Date().getFullYear() + ' ShadowDog Digital Studios. All Rights Reserved.</small></form>';
    document.body.appendChild(el);
    var input = el.querySelector('input'), err = el.querySelector('.err');
    setTimeout(function () { input.focus(); }, 50);
    el.querySelector('form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var v = input.value.trim(); if (!v) { err.textContent = 'Type your class code.'; return; }
      var h; try { h = await hash(v); } catch (x) { err.textContent = 'This browser cannot check codes. Try Chrome.'; return; }
      if (h === LOCK.master) { store(KEY_UNLOCK, 'm:' + LOCK.mv); document.documentElement.classList.add('is-master'); return open(); }
      var w = windowIndex();
      if (w >= 0 && LOCK.windows[w][1].indexOf(h) >= 0) { store(KEY_UNLOCK, 'w' + w); return open(); }
      err.textContent = 'That code did not work. Check it with your teacher.';
      input.select();
    });
    function open() { if (document.body.getAttribute('data-page') === 'u3-flipbook') { location.reload(); return; } el.remove(); document.documentElement.classList.remove('locked'); }
  }

  /* ---------- search ---------- */
  function initSearch() {
    document.querySelectorAll('.search').forEach(function (box) {
      var input = box.querySelector('input'); var res = document.createElement('div');
      res.className = 'search-results'; res.setAttribute('role', 'listbox'); box.appendChild(res);
      var base = document.body.getAttribute('data-root') || '';
      function run() {
        var q = input.value.trim().toLowerCase();
        if (q.length < 2) { res.classList.remove('open'); res.innerHTML = ''; return; }
        var hits = SEARCH.filter(function (s) { return (s.t + ' ' + (s.k || '')).toLowerCase().indexOf(q) >= 0; }).slice(0, 10);
        res.innerHTML = hits.length ? hits.map(function (h) { return '<a href="' + base + h.u + '"><small>' + h.c + '</small>' + h.t + '</a>'; }).join('') : '<div class="none">No matches in Unit 3.</div>';
        res.classList.add('open');
      }
      input.addEventListener('input', run);
      input.addEventListener('focus', run);
      document.addEventListener('click', function (e) { if (!box.contains(e.target)) res.classList.remove('open'); });
      input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { res.classList.remove('open'); input.blur(); } if (e.key === 'Enter') { var a = res.querySelector('a'); if (a) location.href = a.href; } });
    });
  }

  /* ---------- highlighter ---------- */
  var HL_KEY = 'sds_hl_' + PAGE;
  var hlOn = false;
  function zones() { return Array.prototype.slice.call(document.querySelectorAll('[data-hl]')); }
  function textNodes(root) { var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), a = [], n; while ((n = w.nextNode())) a.push(n); return a; }
  function serialize() {
    var data = {};
    zones().forEach(function (z) {
      var off = 0, ranges = [];
      textNodes(z).forEach(function (t) {
        var len = t.nodeValue.length, m = t.parentNode.closest && t.parentNode.closest('mark.hl');
        if (m && z.contains(m)) { var last = ranges[ranges.length - 1]; if (last && last[1] === off) last[1] = off + len; else ranges.push([off, off + len]); }
        off += len;
      });
      if (ranges.length) data[z.getAttribute('data-hl')] = ranges;
    });
    store(HL_KEY, Object.keys(data).length ? JSON.stringify(data) : null);
  }
  function wrapOffsets(z, s, e) {
    var off = 0;
    textNodes(z).forEach(function (t) {
      var len = t.nodeValue.length, a = Math.max(s, off), b = Math.min(e, off + len);
      if (b > a && !(t.parentNode.closest && t.parentNode.closest('mark.hl'))) {
        var node = t;
        if (a > off) node = node.splitText(a - off);
        if (b < off + len) node.splitText(b - a);
        if (/\S/.test(node.nodeValue)) { var m = document.createElement('mark'); m.className = 'hl'; node.parentNode.insertBefore(m, node); m.appendChild(node); }
      }
      off += len;
    });
  }
  function restore() {
    var raw = store(HL_KEY); if (!raw) return;
    try { var data = JSON.parse(raw); zones().forEach(function (z) { (data[z.getAttribute('data-hl')] || []).forEach(function (r) { wrapOffsets(z, r[0], r[1]); }); }); } catch (e) {}
  }
  function offsetIn(z, node, nodeOff) {
    var off = 0, found = -1;
    textNodes(z).some(function (t) { if (t === node) { found = off + nodeOff; return true; } off += t.nodeValue.length; return false; });
    return found;
  }
  function onSelect() {
    if (!hlOn) return;
    var sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    var r = sel.getRangeAt(0);
    zones().forEach(function (z) {
      if (!r.intersectsNode(z)) return;
      var s = 0, e = z.textContent.length;
      if (z.contains(r.startContainer) && r.startContainer.nodeType === 3) s = offsetIn(z, r.startContainer, r.startOffset);
      if (z.contains(r.endContainer) && r.endContainer.nodeType === 3) e = offsetIn(z, r.endContainer, r.endOffset);
      if (s >= 0 && e > s) wrapOffsets(z, s, e);
    });
    sel.removeAllRanges(); serialize();
  }
  function onMarkClick(e) {
    var m = e.target.closest && e.target.closest('mark.hl'); if (!m || !hlOn) return;
    var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); serialize();
  }

  /* ---------- notes ---------- */
  var NOTE_KEY = 'sds_notes_' + PAGE;
  function initTools() {
    if (!zones().length && !document.body.hasAttribute('data-notes')) return;
    var dock = document.createElement('div'); dock.className = 'tools-dock no-print';
    var tip = '<div class="hl-tip" role="status">Highlighter is on. Select words to highlight them. Click a highlight to remove it. Highlights save on this device.</div>';
    dock.innerHTML = tip + '<button type="button" class="btn" data-act="notes">My Notes</button>' + (zones().length ? '<button type="button" class="btn" data-act="hl" aria-pressed="false">Highlighter</button>' : '');
    document.body.appendChild(dock);
    var panel = document.createElement('div'); panel.className = 'notes-panel no-print'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'My Notes');
    panel.innerHTML = '<header>My Notes <button type="button" class="btn" data-act="close" style="min-height:36px;padding:0 12px">Close</button></header>' +
      '<label class="sr" for="sds-notes">My notes for this page</label><textarea id="sds-notes" placeholder="Type your notes. They save on this device."></textarea>' +
      '<footer><span>Saves automatically</span><button type="button" class="btn" data-act="dl" style="min-height:36px;padding:0 12px">Download</button><button type="button" class="btn" data-act="clearhl" style="min-height:36px;padding:0 12px">Clear highlights</button></footer>';
    document.body.appendChild(panel);
    var ta = panel.querySelector('textarea'); ta.value = store(NOTE_KEY) || '';
    ta.addEventListener('input', function () { store(NOTE_KEY, ta.value || null); });
    dock.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.act === 'notes') { panel.classList.toggle('open'); if (panel.classList.contains('open')) ta.focus(); }
      if (b.dataset.act === 'hl') { hlOn = !hlOn; document.documentElement.classList.toggle('hl-on', hlOn); b.setAttribute('aria-pressed', hlOn); dock.querySelector('.hl-tip').classList.toggle('show', hlOn); }
    });
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.act === 'close') panel.classList.remove('open');
      if (b.dataset.act === 'dl') download((document.title || 'notes') + ' - my notes.txt', document.title + '\n\n' + ta.value, 'text/plain');
      if (b.dataset.act === 'clearhl' && confirm('Remove all highlights on this page?')) { document.querySelectorAll('mark.hl').forEach(function (m) { var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); }); store(HL_KEY, null); }
    });
    document.addEventListener('mouseup', onSelect);
    document.addEventListener('touchend', function () { setTimeout(onSelect, 30); });
    document.addEventListener('click', onMarkClick);
    restore();
  }

  function download(name, text, type) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'application/octet-stream' }));
    a.download = name.replace(/[\\/:*?"<>|]/g, '-'); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- assignment autosave ---------- */
  function initWork() {
    var form = document.querySelector('form[data-work]'); if (!form) return;
    var KEY = 'sds_work_' + form.getAttribute('data-work');
    var status = document.querySelector('[data-save-status]');
    function fields() { return Array.prototype.slice.call(form.querySelectorAll('[name]')); }
    function collect() { var o = {}; fields().forEach(function (f) { if (f.type === 'radio') { if (f.checked) o[f.name] = f.value; } else if (f.type === 'checkbox') { o[f.name] = f.checked; } else o[f.name] = f.value; }); return o; }
    function apply(o) { fields().forEach(function (f) { if (!(f.name in o)) return; if (f.type === 'radio') f.checked = (o[f.name] === f.value); else if (f.type === 'checkbox') f.checked = !!o[f.name]; else f.value = o[f.name]; }); form.dispatchEvent(new Event('restored')); }
    function save() { store(KEY, JSON.stringify(collect())); if (status) { status.textContent = 'Saved on this device ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } }
    try { var saved = JSON.parse(store(KEY) || 'null'); if (saved) { apply(saved); if (status) status.textContent = 'Your saved work was restored.'; } } catch (e) {}
    form.addEventListener('input', save); form.addEventListener('change', save);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    document.querySelectorAll('[data-work-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-work-act');
        if (act === 'print') window.print();
        if (act === 'download') download(form.getAttribute('data-work') + ' - my work.json', JSON.stringify({ page: form.getAttribute('data-work'), saved: new Date().toISOString(), work: collect() }, null, 1), 'application/json');
        if (act === 'restore') { var fi = document.createElement('input'); fi.type = 'file'; fi.accept = '.json,application/json'; fi.onchange = function () { var r = new FileReader(); r.onload = function () { try { var d = JSON.parse(r.result); apply(d.work || d); save(); if (status) status.textContent = 'Work restored from your file.'; } catch (x) { alert('That file could not be read.'); } }; r.readAsText(fi.files[0]); }; fi.click(); }
        if (act === 'clear' && confirm('Erase all your answers on this page? This cannot be undone.')) { store(KEY, null); form.reset(); form.dispatchEvent(new Event('restored')); if (status) status.textContent = 'Cleared.'; }
      });
    });
  }

  function masterDevice() { return store(KEY_UNLOCK) === 'm:' + LOCK.mv; }
  if (masterDevice()) document.documentElement.classList.add('is-master');
  window.SDS = { masterDevice: masterDevice, store: store, download: download, hash: hash, windowIndex: windowIndex,
    isMaster: async function (code) { try { return (await hash(code)) === LOCK.master; } catch (e) { return false; } } };

  /* ---------- The Reading Room: flip-book reader ---------- */
  var reader = null;
  function openReader(ch) {
    var base = document.body.getAttribute('data-root') || '';
    var url = base + 'flipbook/index.html' + (ch ? '#ch' + ch : '');
    if (!reader) {
      reader = document.createElement('div'); reader.className = 'reader no-print'; reader.setAttribute('role', 'dialog'); reader.setAttribute('aria-label', 'Unit 3 book');
      var rib = ''; for (var i = 1; i <= 10; i++) rib += '<button type="button" data-rch="' + i + '" aria-label="Go to Chapter ' + i + '">' + i + '</button>';
      reader.innerHTML = '<div class="reader-bar"><span class="rt"><small>The Reading Room</small>Unit 3 · Industry, Immigration &amp; Reform</span>' +
        '<a class="btn" data-full href="' + base + 'flipbook/index.html" target="_blank" rel="noopener">Open in its own tab</a><button type="button" class="btn dark" data-close>Close the book</button></div>' +
        '<div class="reader-body"><nav class="reader-ribbons" aria-label="Chapters">' + rib + '</nav><iframe title="Unit 3 flip-book" loading="lazy"></iframe></div>';
      document.body.appendChild(reader);
      reader.querySelector('[data-close]').addEventListener('click', closeReader);
      reader.addEventListener('click', function (e) { var b = e.target.closest('[data-rch]'); if (b) goChapter(+b.dataset.rch); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && reader && !reader.hidden) closeReader(); });
    }
    var fr = reader.querySelector('iframe');
    if (!fr.getAttribute('src')) fr.setAttribute('src', url); else if (ch) goChapter(ch);
    markRibbon(ch); reader.hidden = false; document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { reader.querySelector('[data-close]').focus(); }, 50);
  }
  function goChapter(ch) {
    var fr = reader.querySelector('iframe');
    try { fr.contentWindow.location.hash = 'ch' + ch; } catch (e) { fr.setAttribute('src', (document.body.getAttribute('data-root') || '') + 'flipbook/index.html#ch' + ch); }
    markRibbon(ch);
  }
  function markRibbon(ch) { reader.querySelectorAll('[data-rch]').forEach(function (b) { b.setAttribute('aria-current', String(+b.dataset.rch === +ch)); }); }
  function closeReader() { reader.hidden = true; document.documentElement.style.overflow = ''; document.querySelectorAll('.book3d.opening').forEach(function (b) { b.classList.remove('opening'); }); }
  function initReader() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-reader]'); if (!t) return;
      e.preventDefault();
      var ch = t.getAttribute('data-reader') || '';
      if (t.classList.contains('book3d')) { t.classList.add('opening'); setTimeout(function () { openReader(ch); }, 650); }
      else openReader(ch);
    });
  }

  function ready() {
    if (!unlocked()) showLock(); else document.documentElement.classList.remove('locked');
    initSearch(); initTools(); initWork(); initReader();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
