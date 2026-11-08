/* Promise & Practice · Unit 3 — assignment self-checks. © 2026 ShadowDog Digital Studios. All Rights Reserved. */
(function () {
  'use strict';
  function clearMarks(part) {
    part.querySelectorAll('.mark').forEach(function (m) { m.textContent = ''; m.className = 'mark'; });
    part.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('right', 'wrong'); });
    part.querySelectorAll('.why').forEach(function (w) { w.hidden = true; });
    part.querySelectorAll('.year').forEach(function (y) { y.textContent = ''; });
    var s = part.querySelector('.score'); if (s) s.textContent = '';
  }
  function check(part) {
    clearMarks(part);
    var right = 0, total = 0, blank = 0;
    part.querySelectorAll('.sort-row').forEach(function (row) {
      var sel = row.querySelector('select'); if (!sel) return;
      total++;
      var m = row.querySelector('.mark');
      if (sel.value === '') { blank++; m.textContent = 'Not answered'; m.className = 'mark no'; return; }
      var ok = sel.value === row.dataset.answer;
      if (ok) right++;
      m.textContent = ok ? '✓ Correct' : '✗ Try again'; m.className = 'mark ' + (ok ? 'ok' : 'no');
      var y = row.querySelector('.year'); if (y && row.dataset.year && ok) y.textContent = row.dataset.year;
      if (row.dataset.src && ok) { var c = row.querySelector('.src-hide'); if (c) c.textContent = row.dataset.src; }
    });
    part.querySelectorAll('fieldset.mc').forEach(function (fs) {
      total++;
      var pick = fs.querySelector('input:checked');
      if (!pick) { blank++; return; }
      var ok = pick.value === fs.dataset.answer; if (ok) right++;
      pick.closest('.opt').classList.add(ok ? 'right' : 'wrong');
      if (ok) fs.querySelector('.why').hidden = false;
    });
    var s = part.querySelector('.score');
    if (s) s.textContent = right + ' of ' + total + ' correct' + (blank ? ' · ' + blank + ' not answered' : '') + (right === total ? ' — nice work!' : '');
  }
  document.querySelectorAll('[data-check]').forEach(function (b) {
    b.addEventListener('click', function () { check(b.closest('.part')); });
  });
  var form = document.querySelector('form[data-work]');
  if (form) form.addEventListener('restored', function () { document.querySelectorAll('.part').forEach(clearMarks); });
})();
