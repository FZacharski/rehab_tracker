'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const RF = require('../core.js');

/* ── pomocnicze ── */
function fullDay(ids) { return { completed: ids.slice(), pain: 0, difficulty: 0, note: '' }; }

/* ── daty ── */
test('addDays przekracza granice miesiąca i roku', () => {
  assert.strictEqual(RF.addDays('2026-01-31', 1), '2026-02-01');
  assert.strictEqual(RF.addDays('2026-12-31', 1), '2027-01-01');
  assert.strictEqual(RF.addDays('2026-03-01', -1), '2026-02-28');
  assert.strictEqual(RF.addDays('2024-02-28', 1), '2024-02-29'); // rok przestępny
});

test('diffDays liczy odstępy dni', () => {
  assert.strictEqual(RF.diffDays('2026-06-01', '2026-06-11'), 10);
  assert.strictEqual(RF.diffDays('2026-06-11', '2026-06-11'), 0);
  assert.strictEqual(RF.diffDays('2026-06-11', '2026-06-01'), -10);
});

test('keyFromDate formatuje z zerami wiodącymi', () => {
  assert.strictEqual(RF.keyFromDate(new Date(2026, 0, 5)), '2026-01-05');
});

/* ── doneCount / isFull ── */
test('doneCount ignoruje usunięte ćwiczenia', () => {
  const days = { '2026-06-11': fullDay([1, 2, 99]) };
  assert.strictEqual(RF.doneCount(days, [1, 2], '2026-06-11'), 2);
});

test('isFull wymaga wszystkich istniejących ćwiczeń', () => {
  const days = { '2026-06-11': fullDay([1]) };
  assert.strictEqual(RF.isFull(days, [1, 2], '2026-06-11'), false);
  assert.strictEqual(RF.isFull(days, [1], '2026-06-11'), true);
  assert.strictEqual(RF.isFull({}, [], '2026-06-11'), false); // brak ćwiczeń ≠ pełny dzień
});

/* ── streak ── */
test('streak: zero bez żadnych danych', () => {
  assert.strictEqual(RF.computeStreak({}, [1], '2026-06-11'), 0);
});

test('streak: niedokończone dziś nie przerywa passy', () => {
  const days = {
    '2026-06-09': fullDay([1]),
    '2026-06-10': fullDay([1]),
  };
  assert.strictEqual(RF.computeStreak(days, [1], '2026-06-11'), 2);
});

test('streak: dzisiejszy pełny dzień się liczy', () => {
  const days = {
    '2026-06-10': fullDay([1]),
    '2026-06-11': fullDay([1]),
  };
  assert.strictEqual(RF.computeStreak(days, [1], '2026-06-11'), 2);
});

test('streak: dziura przerywa passę', () => {
  const days = {
    '2026-06-07': fullDay([1]),
    '2026-06-09': fullDay([1]),
    '2026-06-10': fullDay([1]),
  };
  assert.strictEqual(RF.computeStreak(days, [1], '2026-06-11'), 2);
});

test('streak: brak ćwiczeń daje 0', () => {
  assert.strictEqual(RF.computeStreak({ '2026-06-10': fullDay([1]) }, [], '2026-06-11'), 0);
});

/* ── XP ── */
test('XP: 10 za ćwiczenie + 25 bonus za pełny dzień', () => {
  const days = {
    '2026-06-10': fullDay([1, 2]),       // 20 + 25
    '2026-06-11': fullDay([1]),          // 10 (niepełny przy 2 ćwiczeniach)
  };
  assert.strictEqual(RF.computeXP(days, [1, 2]), 55);
});

test('XP: usunięte ćwiczenia nie liczą się do XP', () => {
  const days = { '2026-06-11': fullDay([1, 99]) };
  assert.strictEqual(RF.computeXP(days, [1]), 10 + 25);
});

/* ── weekPct ── */
test('weekPct liczy tylko dni, które już minęły', () => {
  const days = {
    '2026-06-08': fullDay([1]),
    '2026-06-09': fullDay([1]),
  };
  // tydzień 0 od 2026-06-08, dziś 2026-06-11 → minęły 4 dni, pełne 2
  assert.strictEqual(RF.weekPct(days, [1], '2026-06-08', 0, '2026-06-11'), 50);
});

test('weekPct: pełny miniony tydzień daje 100', () => {
  const days = {};
  for (let i = 0; i < 7; i++) days[RF.addDays('2026-06-01', i)] = fullDay([1]);
  assert.strictEqual(RF.weekPct(days, [1], '2026-06-01', 0, '2026-06-11'), 100);
});

/* ── cycleStats ── */
test('cycleStats podsumowuje cykl', () => {
  const days = {
    '2026-06-01': { completed: [1], pain: 4, difficulty: 0, note: '' },
    '2026-06-02': { completed: [1], pain: 2, difficulty: 0, note: '' },
    '2026-06-03': { completed: [], pain: 0, difficulty: 0, note: '' },
  };
  const st = RF.cycleStats(days, [1], '2026-06-01', 4, '2026-06-04');
  assert.strictEqual(st.doneDays, 2);
  assert.strictEqual(st.elapsed, 4);
  assert.strictEqual(st.totalDays, 28);
  assert.strictEqual(st.avgPain, 3);
});

/* ── plural ── */
test('plural odmienia polskie liczebniki', () => {
  const p = (n) => RF.plural(n, 'seria', 'serie', 'serii');
  assert.strictEqual(p(1), 'seria');
  assert.strictEqual(p(2), 'serie');
  assert.strictEqual(p(4), 'serie');
  assert.strictEqual(p(5), 'serii');
  assert.strictEqual(p(11), 'serii');
  assert.strictEqual(p(12), 'serii');
  assert.strictEqual(p(14), 'serii');
  assert.strictEqual(p(22), 'serie');
  assert.strictEqual(p(25), 'serii');
  assert.strictEqual(p(112), 'serii');
  assert.strictEqual(RF.plural(1, 'dzień', 'dni', 'dni'), 'dzień');
  assert.strictEqual(RF.plural(7, 'dzień', 'dni', 'dni'), 'dni');
});

test('cycleStats: avgPain null bez danych o bólu', () => {
  const st = RF.cycleStats({}, [1], '2026-06-01', 2, '2026-06-05');
  assert.strictEqual(st.avgPain, null);
  assert.strictEqual(st.totalDays, 14);
});

/* ── harmonogram tygodniowy ── */
// 2026-06-08 = poniedziałek (1), 2026-06-09 = wtorek (2), ...
const MON = { id: 1, days: [1] };          // tylko poniedziałki
const DAILY = { id: 2 };                   // codziennie (brak days)

test('idsForDay zwraca tylko ćwiczenia zaplanowane na dany dzień', () => {
  assert.deepStrictEqual(RF.idsForDay([MON, DAILY], '2026-06-08'), [1, 2]); // pon
  assert.deepStrictEqual(RF.idsForDay([MON, DAILY], '2026-06-09'), [2]);    // wt
});

test('isRestDay: dzień bez zaplanowanych ćwiczeń', () => {
  assert.strictEqual(RF.isRestDay([MON], '2026-06-09'), true);  // wt, tylko pon w planie
  assert.strictEqual(RF.isRestDay([MON], '2026-06-08'), false);
  assert.strictEqual(RF.isRestDay([], '2026-06-08'), false);    // brak programu ≠ odpoczynek
});

test('isFull z harmonogramem: wystarczą ćwiczenia zaplanowane na ten dzień', () => {
  const days = { '2026-06-09': fullDay([2]) }; // wtorek: tylko DAILY zaplanowane
  assert.strictEqual(RF.isFull(days, [MON, DAILY], '2026-06-09'), true);
  assert.strictEqual(RF.isFull(days, [MON, DAILY], '2026-06-08'), false); // pon wymaga obu
});

test('streak: dni odpoczynku nie przerywają passy i nie są liczone', () => {
  // plan: pon+wt (id 1), dziś czwartek 2026-06-11; śr = odpoczynek
  const ex = [{ id: 1, days: [1, 2] }];
  const days = {
    '2026-06-08': fullDay([1]), // pon
    '2026-06-09': fullDay([1]), // wt
  };
  assert.strictEqual(RF.computeStreak(days, ex, '2026-06-11'), 2);
});

test('streak: pusty harmonogram wszystkich ćwiczeń daje 0 (bez zapętlenia)', () => {
  assert.strictEqual(RF.computeStreak({}, [{ id: 1, days: [] }], '2026-06-11'), 0);
});

test('weekPct ignoruje dni odpoczynku w mianowniku', () => {
  // plan: tylko pon+wt; tydzień od pon 2026-06-08, dziś czw 2026-06-11
  const ex = [{ id: 1, days: [1, 2] }];
  const days = { '2026-06-08': fullDay([1]) }; // pon zrobiony, wt nie
  assert.strictEqual(RF.weekPct(days, ex, '2026-06-08', 0, '2026-06-11'), 50);
});

test('cycleStats z harmonogramem: totalDays liczy tylko dni treningowe', () => {
  const ex = [{ id: 1, days: [1, 3, 5] }]; // pon/śr/pt
  const st = RF.cycleStats({}, ex, '2026-06-08', 2, '2026-06-08');
  assert.strictEqual(st.totalDays, 6); // 3 dni × 2 tygodnie
});

/* ── XP ćwiczeń ── */
test('exerciseXP: powtórzenia i tryb czasowy', () => {
  assert.strictEqual(RF.exerciseXP({ sets: 3, reps: 10 }), 16);            // 3*10/5+10
  assert.strictEqual(RF.exerciseXP({ sets: 3, seconds: 30, mode: 'time' }), 19); // 3*30/10+10
  assert.strictEqual(RF.exerciseXP({}), 10);
});

test('computeXP używa pełnej wartości ćwiczenia', () => {
  const ex = [{ id: 1, sets: 3, reps: 10 }];
  const days = { '2026-06-10': fullDay([1]) };
  assert.strictEqual(RF.computeXP(days, ex), 16 + 25);
});

/* ── misje: deterministyczny wybór ── */
test('pickIndices: ten sam seed daje ten sam wynik, indeksy unikalne', () => {
  const a = RF.pickIndices('2026-07-06', 8, 3);
  const b = RF.pickIndices('2026-07-06', 8, 3);
  assert.deepStrictEqual(a, b);
  assert.strictEqual(new Set(a).size, 3);
  a.forEach(i => assert.ok(i >= 0 && i < 8));
  const c = RF.pickIndices('2026-07-13', 8, 3);
  assert.notDeepStrictEqual(a, c); // inny tydzień → (niemal na pewno) inne misje
});

/* ── dni usprawiedliwione ── */
test('streak: dzień usprawiedliwiony nie przerywa passy', () => {
  const days = {
    '2026-06-08': fullDay([1]),
    '2026-06-09': { completed: [], pain: 0, difficulty: 0, note: '', excused: true }, // choroba
    '2026-06-10': fullDay([1]),
  };
  assert.strictEqual(RF.computeStreak(days, [1], '2026-06-11'), 2);
});

test('streak: pełny dzień mimo usprawiedliwienia liczy się normalnie', () => {
  const days = {
    '2026-06-09': { completed: [1], pain: 0, difficulty: 0, note: '', excused: true },
    '2026-06-10': fullDay([1]),
  };
  assert.strictEqual(RF.computeStreak(days, [1], '2026-06-11'), 2);
});

test('weekPct: usprawiedliwiony niewykonany dzień poza mianownikiem', () => {
  const days = {
    '2026-06-08': fullDay([1]),
    '2026-06-09': { completed: [], pain: 0, difficulty: 0, note: '', excused: true },
  };
  // pon zrobiony, wt usprawiedliwiony, śr-czw (do "dziś" 2026-06-11) niezrobione → 1/3
  assert.strictEqual(RF.weekPct(days, [1], '2026-06-08', 0, '2026-06-11'), 33);
});

test('cycleStats: usprawiedliwione dni poza elapsed i totalDays', () => {
  const days = {
    '2026-06-01': fullDay([1]),
    '2026-06-02': { completed: [], pain: 0, difficulty: 0, note: '', excused: true },
  };
  const st = RF.cycleStats(days, [1], '2026-06-01', 1, '2026-06-03');
  assert.strictEqual(st.doneDays, 1);
  assert.strictEqual(st.elapsed, 2);   // 1, 3 (2 usprawiedliwiony)
  assert.strictEqual(st.totalDays, 6); // 7 - 1 usprawiedliwiony
});

test('mondayOf zwraca poniedziałek tygodnia', () => {
  assert.strictEqual(RF.mondayOf('2026-06-11'), '2026-06-08'); // czwartek → pon
  assert.strictEqual(RF.mondayOf('2026-06-08'), '2026-06-08'); // pon → pon
  assert.strictEqual(RF.mondayOf('2026-06-14'), '2026-06-08'); // nd → pon
});
