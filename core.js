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

  /* dzień usprawiedliwiony (choroba, zalecona przerwa) — nie przerywa passy,
     nie liczy się do mianowników; pełne wykonanie mimo usprawiedliwienia liczy się normalnie */
  function isExcused(days, k) {
    return ((days[k] || {}).excused) === true;
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
      if (isFull(days, ex, d)) { streak++; d = addDays(d, -1); continue; }
      if (isRestDay(ex, d) || isExcused(days, d)) { d = addDays(d, -1); continue; }
      break;
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
      if (isFull(days, ex, d)) { possible++; done++; continue; }
      if (isExcused(days, d)) continue; // usprawiedliwiony i niewykonany — poza mianownikiem
      possible++;
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
      const full = !rest && isFull(days, ex, k);
      const skipped = !rest && !full && isExcused(days, k); // usprawiedliwiony bez treningu
      if (!rest && !skipped) totalDays++;
      if (k > todayK) continue;
      if (!rest && !skipped) {
        elapsed++;
        if (full) doneDays++;
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

  /* ── inteligentna progresja: analiza ostatnich dni treningowych ──
     Zwraca sugestię na podstawie trudności i bólu z dni, w których pacjent
     realnie ćwiczył (pełny dzień). NIE modyfikuje danych — tylko rekomendacja.
     Wynik: null | { type:'increase'|'caution'|'ease', pain, diff, days } */
  function analyzeProgression(days, exercises, todayK) {
    const ex = normEx(exercises);
    if (!hasAnyScheduledDay(ex)) return null;

    /* zbierz ostatnie pełne dni treningowe (max 10 wstecz od dziś), od najnowszego */
    const full = [];
    let d = todayK, guard = 0;
    while (full.length < 6 && guard++ < 40) {
      if (!isRestDay(ex, d) && isFull(days, ex, d)) {
        const dd = days[d] || {};
        full.push({ k: d, pain: dd.pain || 0, diff: dd.difficulty || 0 });
      }
      d = addDays(d, -1);
    }
    if (full.length < 4) return null; // za mało danych na wniosek

    const last4 = full.slice(0, 4);
    const withPain = last4.filter(function (x) { return x.pain > 0; });
    const avgPain = withPain.length ? withPain.reduce(function (s, x) { return s + x.pain; }, 0) / withPain.length : 0;
    const withDiff = last4.filter(function (x) { return x.diff > 0; });
    const avgDiff = withDiff.length ? withDiff.reduce(function (s, x) { return s + x.diff; }, 0) / withDiff.length : 0;

    /* ostrzeżenie: ból rośnie 3 pełne dni z rzędu (monotonicznie) i sięga >=5 */
    if (full.length >= 3) {
      var p0 = full[0].pain, p1 = full[1].pain, p2 = full[2].pain;
      if (p0 > 0 && p1 > 0 && p2 > 0 && p0 > p1 && p1 > p2 && p0 >= 5) {
        return { type: 'ease', pain: Math.round(avgPain * 10) / 10, diff: Math.round(avgDiff * 10) / 10, days: full.length };
      }
    }

    /* ostrożnie: średni ból wysoki (>=6) mimo braku trendu */
    if (withPain.length >= 3 && avgPain >= 6) {
      return { type: 'caution', pain: Math.round(avgPain * 10) / 10, diff: Math.round(avgDiff * 10) / 10, days: full.length };
    }

    /* zwiększ dawkę: co najmniej 4 pełne dni, trudność niska (<=3) i ból niski (<=2) */
    if (withDiff.length >= 3 && avgDiff > 0 && avgDiff <= 3 && avgPain <= 2) {
      return { type: 'increase', pain: Math.round(avgPain * 10) / 10, diff: Math.round(avgDiff * 10) / 10, days: full.length };
    }

    return null;
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
    isExcused: isExcused,
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
    analyzeProgression: analyzeProgression,
  };
});
