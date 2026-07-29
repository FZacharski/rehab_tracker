/* RehabFlow ui-common — drobne stałe i helpery UI wspólne dla index.html
   i fizjo.html. Trzymamy je tutaj, żeby nie rozjeżdżały się między stronami
   (dodanie nowego rodzaju pomiaru wymagało wcześniej edycji dwóch plików).

   UWAGA: DAYS_PL/MONTHS_PL celowo NIE są tutaj — w index.html to zmienne
   podmieniane przez i18n (RFI18N.arr), a fizjo.html jest tylko po polsku. */
(function (root) {
  'use strict';

  /* escape treści użytkownika przed wstawieniem do innerHTML */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* kolejność dni w UI: poniedziałek…niedziela (0=Nd wg Date.getDay/RFCore) */
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

  /* rodzaje pomiarów postępu; w index.html etykiety idą jeszcze przez tt() */
  const MEAS_LABELS = { rom: 'Zakres ruchu', obwod: 'Obwód', waga: 'Waga', inne: 'Inne' };
  const MEAS_UNITS = { rom: '°', obwod: 'cm', waga: 'kg', inne: '' };

  const api = { esc: esc, DAY_ORDER: DAY_ORDER, MEAS_LABELS: MEAS_LABELS, MEAS_UNITS: MEAS_UNITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.RFUI = api;
    root.esc = esc;
    root.DAY_ORDER = DAY_ORDER;
    root.MEAS_LABELS = MEAS_LABELS;
    root.MEAS_UNITS = MEAS_UNITS;
  }
})(typeof self !== 'undefined' ? self : this);
