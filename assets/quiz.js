/* Promise & Practice · Unit 3 — quiz engine. One attempt + one retake, result code for Classroom.
   © 2026 ShadowDog Digital Studios. All Rights Reserved. */
(function () {
  'use strict';
  var SALT = 'sds-u3-quiz|';
  async function sha(s) {
    var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }
  function normName(n) { return String(n || '').toLowerCase().replace(/[^a-z]/g, ''); }
  async function makeCode(prefix, period, score, total, name) {
    var core = prefix + '-P' + period + '-' + score + '/' + total;
    var chk = (await sha(SALT + normName(name) + '|' + core)).slice(0, 4).toUpperCase();
    return core + '-' + chk;
  }
  async function verify(name, code) {
    var m = String(code || '').trim().toUpperCase().match(/^([A-Z]+)-P(\d+)-(\d+)\/(\d+)-([0-9A-F]{4})$/);
    if (!m) return 'That does not look like a result code.';
    var good = await makeCode(m[1], m[2], m[3], m[4], name);
    return good === code.trim().toUpperCase() ? '✓ Valid: ' + m[3] + ' of ' + m[4] + ', period ' + m[2] + '.' : '✗ Does not match this name. Check the spelling of the name, or the code may have been changed.';
  }
  window.SDSQuiz = { verify: verify };

  var root = document.querySelector('.quiz[data-quiz]'); if (!root) return;
  var slug = root.dataset.quiz, prefix = root.dataset.code, total = +root.dataset.total;
  var KEY = 'sds_quiz_' + slug;
  var form = root.querySelector('.quiz-form'), status = root.querySelector('.quiz-status');
  var nameEl = document.getElementById('qz-name'), perEl = document.getElementById('qz-period');
  function load() { try { return JSON.parse(SDS.store(KEY) || '{}'); } catch (e) { return {}; } }
  function save(st) { SDS.store(KEY, JSON.stringify(st)); }
  var st = load(); st.attempts = st.attempts || []; st.draft = st.draft || {};

  function answers() { var o = {}; form.querySelectorAll('input[type=radio]:checked').forEach(function (r) { o[r.name] = r.value; }); return o; }
  function applyAnswers(a) { form.querySelectorAll('input[type=radio]').forEach(function (r) { r.checked = a[r.name] === r.value; }); }
  function countAnswered() { var n = Object.keys(answers()).length; root.querySelector('.answered').textContent = n + ' of ' + total + ' answered'; return n; }
  function clearMarks() { form.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('right', 'wrong'); }); form.querySelectorAll('.why').forEach(function (w) { w.hidden = true; }); }
  function mark(a) {
    var score = 0;
    form.querySelectorAll('.qq').forEach(function (fs, i) {
      var ans = fs.dataset.answer, pick = a['q' + i];
      fs.querySelectorAll('.opt').forEach(function (o) {
        var v = o.querySelector('input').value;
        if (v === ans) o.classList.add('right'); else if (v === pick) o.classList.add('wrong');
      });
      fs.querySelector('.why').hidden = false;
      if (pick === ans) score++;
    });
    return score;
  }
  function lockForm(on) { form.classList.toggle('quiz-done', on); form.querySelectorAll('input').forEach(function (i) { i.disabled = on; }); var sb = form.querySelector('[type=submit]'); if (sb) sb.hidden = on; }
  function best() { return st.attempts.reduce(function (b, x) { return !b || x.score > b.score ? x : b; }, null); }
  function showStatus() {
    if (!st.attempts.length) { status.hidden = true; return; }
    var b = best(), left = 2 - st.attempts.length;
    status.hidden = false;
    status.innerHTML = '<span class="kicker">Your result' + (st.attempts.length > 1 ? ' (best of 2 tries)' : '') + '</span>' +
      '<div class="big">' + b.score + ' of ' + total + '</div>' +
      '<p>Copy this result code into Google Classroom:</p><code>' + b.code + '</code>' +
      st.attempts.map(function (x, i) { return '<p class="credit">Try ' + (i + 1) + ': ' + x.score + ' of ' + total + ' · ' + new Date(x.at).toLocaleString() + ' · ' + x.code + '</p>'; }).join('') +
      (left > 0 ? '<p><strong>You have one retake.</strong> Review the answers below first. Your best score counts.</p><div><button type="button" class="btn primary" data-retake>Start my retake</button></div>' :
        '<p>You have used your try and your retake. Review the answers below.</p>');
    var rb = status.querySelector('[data-retake]');
    if (rb) rb.onclick = function () {
      if (!confirm('Start your retake? This is your last try.')) return;
      st.draft = {}; save(st); clearMarks(); applyAnswers({}); lockForm(false); countAnswered();
      status.hidden = true; form.scrollIntoView({ behavior: 'smooth' });
      st.retaking = true; save(st);
    };
  }

  if (st.name) nameEl.value = st.name; if (st.period) perEl.value = st.period;
  nameEl.addEventListener('input', function () { st.name = nameEl.value; save(st); });
  perEl.addEventListener('change', function () { st.period = perEl.value; save(st); });

  if (st.attempts.length && !st.retaking) {
    var last = st.attempts[st.attempts.length - 1];
    applyAnswers(last.answers); mark(last.answers); lockForm(true);
  } else applyAnswers(st.draft);
  showStatus(); countAnswered();

  form.addEventListener('change', function () { st.draft = answers(); save(st); countAnswered(); });
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (st.attempts.length >= 2) return;
    if (!nameEl.value.trim() || !perEl.value) { alert('Type your name and choose your period at the top first.'); nameEl.focus(); return; }
    var n = countAnswered();
    if (n < total && !confirm('You answered ' + n + ' of ' + total + ' questions. Submit anyway?')) return;
    var a = answers(); clearMarks(); var score = mark(a);
    var code = await makeCode(prefix, perEl.value, score, total, nameEl.value);
    st.attempts.push({ score: score, code: code, at: new Date().toISOString(), answers: a });
    st.draft = {}; st.retaking = false; save(st);
    lockForm(true); showStatus(); status.scrollIntoView({ behavior: 'smooth' });
  });
  var tr = root.querySelector('[data-teacher-reset]');
  if (tr) tr.onclick = async function () {
    var k = prompt('Teacher master key:'); if (!k) return;
    if (await SDS.isMaster(k)) { SDS.store(KEY, null); location.reload(); } else alert('That is not the master key.');
  };
})();
