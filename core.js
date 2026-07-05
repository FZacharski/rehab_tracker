/* RehabFlow core — czysta logika bez DOM (używana przez aplikację i testy node) */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.RFCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function pad(n) { return String(n).padStart(2, '0'); }
  function keyFromDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dateFromKey(k) { return new Date(k + 'T12:00:00'); }
  function addDays(k, n) { const d = dateFromKey(k); d.setDate(d.getDate() + n); return keyFromDate(d); }
  function diffDays(a, b) { return Math.round((dateFromKey(b) - dateFromKey(a)) / 86400000); }

  /* liczy tylko ukończenia ćwiczeń, które nadal istnieją w programie */
  function doneCount(days, exIds, k) {
    const ids = new Set(exIds);
    return (((days[k] || {}).completed) || []).filter(function (id) { return ids.has(id); }).length;
  }

  function isFull(days, exIds, k) {
    return exIds.length > 0 && doneCount(days, exIds, k) >= exIds.length;
  }

  /* streak: niedokończone "dziś" nie przerywa passy */
  function computeStreak(days, exIds, todayK) {
    if (!exIds.length) return 0;
    let streak = 0, d = todayK;
    if (!isFull(days, exIds, d)) d = addDays(d, -1);
    while (isFull(days, exIds, d)) { streak++; d = addDays(d, -1); }
    return streak;
  }

  /* 10 XP za ćwiczenie + 25 XP bonusu za pełny dzień */
  function computeXP(days, exIds) {
    let xp = 0;
    for (const k of Object.keys(days)) {
      const done = doneCount(days, exIds, k);
      xp += done * 10;
      if (exIds.length > 0 && done >= exIds.length) xp += 25;
    }
    return xp;
  }

  /* % pełnych dni w tygodniu w (0-indeks), licząc tylko dni, które już minęły */
  function weekPct(days, exIds, startDate, w, todayK) {
    if (!exIds.length) return 0;
    const ws = addDays(startDate, w * 7);
    let done = 0, possible = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i);
      if (d > todayK) continue;
      possible++;
      if (isFull(days, exIds, d)) done++;
    }
    return possible ? Math.round(done / possible * 100) : 0;
  }

  /* statystyki cyklu (do archiwum i raportu) */
  function cycleStats(days, exIds, startDate, weeks, todayK) {
    const totalDays = weeks * 7;
    let doneDays = 0, painSum = 0, painN = 0, elapsed = 0;
    for (let i = 0; i < totalDays; i++) {
      const k = addDays(startDate, i);
      if (k > todayK) break;
      elapsed++;
      if (isFull(days, exIds, k)) doneDays++;
      const p = (days[k] || {}).pain || 0;
      if (p > 0) { painSum += p; painN++; }
    }
    return {
      doneDays: doneDays,
      elapsed: elapsed,
      totalDays: totalDays,
      avgPain: painN ? Math.round(painSum / painN * 10) / 10 : null,
    };
  }

  /* polska odmiana: plural(2,'seria','serie','serii') -> 'serie' */
  function plural(n, one, few, many) {
    n = Math.abs(n);
    if (n === 1) return one;
    const d10 = n % 10, d100 = n % 100;
    if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
    return many;
  }

  return {
    plural: plural,
    keyFromDate: keyFromDate,
    dateFromKey: dateFromKey,
    addDays: addDays,
    diffDays: diffDays,
    doneCount: doneCount,
    isFull: isFull,
    computeStreak: computeStreak,
    computeXP: computeXP,
    weekPct: weekPct,
    cycleStats: cycleStats,
  };
});
