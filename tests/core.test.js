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

test('cycleStats: avgPain null bez danych o bólu', () => {
  const st = RF.cycleStats({}, [1], '2026-06-01', 2, '2026-06-05');
  assert.strictEqual(st.avgPain, null);
  assert.strictEqual(st.totalDays, 14);
});
