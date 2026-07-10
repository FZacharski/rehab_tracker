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
  function weekdayOf(k) { return dateFromKey(k).getDay(); } // 0=Nd ... 6=Sb

  /* ćwiczenia mogą być tablicą id (stare API) lub obiektów {id, days?, reps?, sets?, mode?, seconds?} */
  function normEx(exercises) {
    return (exercises || []).map(function (e) {
      return (typeof e === 'object' && e !== null) ? e : { id: e };
    });
  }

  /* harmonogram: ex.days = [0..6] (dni tygodnia) lub null/undefined = codziennie */
  function isScheduled(ex, k) {
    if (!Array.isArray(ex.days) || ex.days.length === 0 || ex.days.length === 7) return true;
    return ex.days.indexOf(weekdayOf(k)) >= 0;
  }

  /* id ćwiczeń zaplanowanych na dany dzień */
  function idsForDay(exercises, k) {
    return normEx(exercises).filter(function (e) { return isScheduled(e, k); }).map(function (e) { return e.id; });
  }

  /* dzień odpoczynku: program istnieje, ale nic nie jest zaplanowane */
  function isRestDay(exercises, k) {
    const ex = normEx(exercises);
    return ex.length > 0 && idsForDay(ex, k).length === 0;
  }

  /* liczy ukończenia ćwiczeń zaplanowanych na dany dzień (i nadal istniejących) */
  function doneCount(days, exercises, k) {
    const ids = new Set(idsForDay(exercises, k));
    return (((days[k] || {}).completed) || []).filter(function (id) { return ids.has(id); }).length;
  }

  /* liczy ukończenia wszystkich istniejących ćwiczeń (także poza planem — do XP) */
  function doneCountAny(days, exercises, k) {
    const ids = new Set(normEx(exercises).map(function (e) { return e.id; }));
    return (((days[k] || {}).completed) || []).filter(function (id) { return ids.has(id); }).length;
  }

  /* pełny dzień = wszystkie zaplanowane na ten dzień ćwiczenia ukończone */
  function isFull(days, exercises, k) {
    const ids = idsForDay(exercises, k);
    return ids.length > 0 && doneCount(days, exercises, k) >= ids.length;
  }

  /* czy program ma w ogóle jakikolwiek zaplanowany dzień tygodnia */
  function hasAnyScheduledDay(exercises) {
    const ex = normEx(exercises);
    if (!ex.length) return false;
    for (let wd = 0; wd < 7; wd++) {
      const someDay = ex.some(function (e) {
        return !Array.isArray(e.days) || e.days.length === 0 || e.days.length === 7 || e.days.indexOf(wd) >= 0;
      });
      if (someDay) return true;
    }
    return false;
  }

  /* streak: dni odpoczynku nie przerywają passy i nie są liczone;
     niedokończone "dziś" (lub dzisiejszy odpoczynek) nie przerywa passy */
  function computeStreak(days, exercises, todayK) {
    const ex = normEx(exercises);
    if (!hasAnyScheduledDay(ex)) return 0;
    let streak = 0, d = todayK, guard = 0;
    if (!isFull(days, ex, d)) d = addDays(d, -1);
    while (guard++ < 3700) {
      if (isRestDay(ex, d)) { d = addDays(d, -1); continue; }
      if (!isFull(days, ex, d)) break;
      streak++; d = addDays(d, -1);
    }
    return streak;
  }

  /* XP za pojedyncze ćwiczenie: powtórzenia lub sekundy */
  function exerciseXP(ex) {
    const sets = Number(ex.sets) || 0;
    if (ex.mode === 'time') return Math.round(sets * (Number(ex.seconds) || 0) / 10) + 10;
    return Math.round(sets * (Number(ex.reps) || 0) / 5) + 10;
  }

  /* XP: pełna wartość ćwiczenia (także wykonanego poza planem) + 25 bonusu za pełny dzień */
  function computeXP(days, exercises) {
    const ex = normEx(exercises);
    const byId = {};
    ex.forEach(function (e) { byId[e.id] = e; });
    let xp = 0;
    for (const k of Object.keys(days)) {
      const completed = ((days[k] || {}).completed) || [];
      for (const id of completed) { if (byId[id]) xp += exerciseXP(byId[id]); }
      if (isFull(days, ex, k)) xp += 25;
    }
    return xp;
  }

  /* % pełnych dni w tygodniu w (0-indeks) — liczą się tylko minione dni z zaplanowanymi ćwiczeniami */
  function weekPct(days, exercises, startDate, w, todayK) {
    const ex = normEx(exercises);
    if (!ex.length) return 0;
    const ws = addDays(startDate, w * 7);
    let done = 0, possible = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i);
      if (d > todayK) continue;
      if (isRestDay(ex, d)) continue;
      possible++;
      if (isFull(days, ex, d)) done++;
    }
    return possible ? Math.round(done / possible * 100) : 0;
  }

  /* statystyki cyklu (do archiwum i raportu) — dni odpoczynku wyłączone z mianownika */
  function cycleStats(days, exercises, startDate, weeks, todayK) {
    const ex = normEx(exercises);
    const span = weeks * 7;
    let doneDays = 0, painSum = 0, painN = 0, elapsed = 0, totalDays = 0;
    for (let i = 0; i < span; i++) {
      const k = addDays(startDate, i);
      const rest = isRestDay(ex, k);
      if (!rest) totalDays++;
      if (k > todayK) continue;
      if (!rest) {
        elapsed++;
        if (isFull(days, ex, k)) doneDays++;
      }
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

  /* ── misje tygodniowe: deterministyczny wybór z puli ── */
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* wybiera `count` różnych indeksów z puli [0, poolSize) — ten sam seed daje ten sam wynik */
  function pickIndices(seedStr, poolSize, count) {
    const rnd = mulberry32(hashStr(String(seedStr)));
    const pool = Array.from({ length: poolSize }, function (_, i) { return i; });
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    return pool.slice(0, Math.min(count, poolSize));
  }

  /* poniedziałek tygodnia zawierającego dzień k — klucz misji tygodniowych */
  function mondayOf(k) {
    return addDays(k, -((weekdayOf(k) + 6) % 7));
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
    weekdayOf: weekdayOf,
    idsForDay: idsForDay,
    isRestDay: isRestDay,
    doneCount: doneCount,
    doneCountAny: doneCountAny,
    isFull: isFull,
    hasAnyScheduledDay: hasAnyScheduledDay,
    computeStreak: computeStreak,
    exerciseXP: exerciseXP,
    computeXP: computeXP,
    weekPct: weekPct,
    cycleStats: cycleStats,
    hashStr: hashStr,
    pickIndices: pickIndices,
    mondayOf: mondayOf,
  };
});
