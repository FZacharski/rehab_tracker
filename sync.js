/* RehabFlow sync — opcjonalna synchronizacja przez Supabase (czysty REST, bez zależności).
   Dwa tryby logowania:
   1) Anonimowe (domyślne) — jeden przycisk „Udostępnij fizjoterapeucie", zero konfiguracji
      dla użytkownika. Wymaga wbudowanego projektu (DEFAULT_URL/DEFAULT_ANON_KEY poniżej)
      i włączonego „Anonymous sign-ins" w Supabase (patrz SUPABASE.md).
   2) E-mail + kod OTP („Zaawansowane") — dla kogoś, kto chce synchronizować to samo konto
      między kilkoma urządzeniami; można też wskazać własny projekt Supabase.
   Działa też w powłoce Capacitor (bez redirectów). */
(function (root) {
  'use strict';

  /* Wbudowany projekt Supabase — uzupełnia właściciel aplikacji po założeniu projektu
     (SUPABASE.md). Klucz anon jest z założenia publiczny; bezpieczeństwo zapewnia RLS
     po stronie bazy. Dopóki puste, przycisk szybkiego udostępniania jest wyłączony,
     a użytkownik może nadal skonfigurować własny projekt w sekcji „Zaawansowane". */
  const DEFAULT_URL = 'https://svyptdkgwrdbuwtooyli.supabase.co';
  const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eXB0ZGtnd3JkYnV3dG9veWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5OTM5OTgsImV4cCI6MjEwMDU2OTk5OH0.08EaFlKsmiRBILUpc8tLjH3kgDvwFgExH52rPyAysqY';

  const KEY = 'rehabflow_sync_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }

  let S = load(); // {url, anonKey, email, anonymous, session:{...}, shareCode, lastSyncAt}
  let pushTimer = null;

  function save() { localStorage.setItem(KEY, JSON.stringify(S)); }

  function hasBuiltIn() { return !!(DEFAULT_URL && DEFAULT_ANON_KEY); }
  function effUrl() { return S.url || DEFAULT_URL; }
  function effKey() { return S.anonKey || DEFAULT_ANON_KEY; }
  function configured() { return !!(effUrl() && effKey()); }
  function usingCustomProject() { return !!(S.url && S.anonKey); }
  function loggedIn() { return !!(S.session && S.session.refresh_token); }
  function isAnonymous() { return loggedIn() && S.anonymous === true; }
  function email() { return S.email || ''; }
  function shareCode() { return S.shareCode || null; }
  function lastSyncAt() { return S.lastSyncAt || null; }

  function setConfig(url, anonKey) {
    url = String(url || '').trim().replace(/\/+$/, '');
    anonKey = String(anonKey || '').trim();
    if (url && !/^https:\/\//.test(url)) throw new Error('Adres projektu musi zaczynać się od https://');
    S.url = url; S.anonKey = anonKey;
    save();
  }

  function base() { return effUrl(); }

  async function http(path, opts, useAuth) {
    const headers = Object.assign(
      { apikey: effKey(), 'Content-Type': 'application/json' },
      (opts && opts.headers) || {}
    );
    if (useAuth) {
      await ensureFresh();
      headers.Authorization = 'Bearer ' + S.session.access_token;
    }
    const res = await fetch(base() + path, Object.assign({}, opts, { headers }));
    const txt = await res.text();
    if (!res.ok) {
      let msg = txt.slice(0, 300);
      try { const j = JSON.parse(txt); msg = j.msg || j.message || j.error_description || j.error || msg; } catch (e) {}
      throw new Error(msg || ('HTTP ' + res.status));
    }
    return txt ? JSON.parse(txt) : null;
  }

  function adoptSession(d) {
    S.session = {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
      user_id: d.user && d.user.id,
    };
    save();
  }

  /* odśwież token, jeśli wygasa w ciągu minuty */
  async function ensureFresh() {
    if (!S.session) throw new Error('Nie zalogowano');
    if (Date.now() < (S.session.expires_at - 60) * 1000) return;
    const res = await fetch(base() + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: effKey(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: S.session.refresh_token }),
    });
    if (!res.ok) { S.session = null; save(); throw new Error('Sesja wygasła — zaloguj się ponownie'); }
    adoptSession(await res.json());
  }

  /* logowanie anonimowe: jedno kliknięcie, bez e-maila i haseł (wymaga Anonymous
     sign-ins włączonych w Supabase) */
  async function signInAnonymously() {
    if (!configured()) throw new Error('Synchronizacja nie jest jeszcze skonfigurowana');
    const d = await http('/auth/v1/signup', { method: 'POST', body: JSON.stringify({}) }, false);
    adoptSession(d);
    S.anonymous = true; S.email = ''; save();
  }

  /* krok 1: wyślij 6-cyfrowy kod na e-mail (tryb zaawansowany — kilka urządzeń) */
  async function requestCode(mail) {
    mail = String(mail || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) throw new Error('Podaj poprawny adres e-mail');
    await http('/auth/v1/otp', { method: 'POST', body: JSON.stringify({ email: mail, create_user: true }) }, false);
    S.email = mail; save();
  }

  /* krok 2: zaloguj kodem z e-maila */
  async function verifyCode(code) {
    code = String(code || '').trim();
    if (!S.email) throw new Error('Najpierw wyślij kod na e-mail');
    if (!/^\d{6}$/.test(code)) throw new Error('Kod ma 6 cyfr');
    const d = await http('/auth/v1/verify', {
      method: 'POST',
      body: JSON.stringify({ type: 'email', email: S.email, token: code }),
    }, false);
    adoptSession(d);
    S.anonymous = false; save();
  }

  function logout() { S.session = null; S.lastSyncAt = null; S.anonymous = false; save(); }

  /* kod udostępnienia dla fizjoterapeuty (bez 0/O/1/I — łatwy do podyktowania) */
  function genCode() {
    const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    const rnd = new Uint32Array(8);
    (self.crypto || {}).getRandomValues ? crypto.getRandomValues(rnd) : rnd.forEach((_, i) => rnd[i] = Math.floor(Math.random() * 4294967296));
    for (let i = 0; i < 8; i++) s += a[rnd[i] % a.length];
    return s;
  }

  /* wyślij lokalne dane na serwer (upsert po user_id) */
  async function push(data) {
    if (!configured() || !loggedIn()) return false;
    if (!S.shareCode) S.shareCode = genCode();
    const now = new Date().toISOString();
    await http('/rest/v1/patient_state', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ user_id: S.session.user_id, data: data, updated_at: now, share_code: S.shareCode }),
    }, true);
    S.lastSyncAt = now; save();
    return true;
  }

  /* pobierz stan z serwera: {data, updated_at, share_code} lub null */
  async function pull() {
    if (!configured() || !loggedIn()) return null;
    const rows = await http('/rest/v1/patient_state?user_id=eq.' + encodeURIComponent(S.session.user_id) + '&select=data,updated_at,share_code', { method: 'GET' }, true);
    const row = rows && rows[0];
    if (row && row.share_code) { S.shareCode = row.share_code; save(); }
    return row || null;
  }

  /* czy serwer ma nowsze dane niż nasza ostatnia synchronizacja */
  function remoteIsNewer(row) {
    return !!(row && row.updated_at && (!S.lastSyncAt || row.updated_at > S.lastSyncAt));
  }

  function markSynced(updatedAt) { S.lastSyncAt = updatedAt || new Date().toISOString(); save(); }

  /* automatyczny, opóźniony push po każdej zmianie danych */
  function schedulePush(getData) {
    if (!configured() || !loggedIn() || !navigator.onLine) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => { push(getData()).catch(() => {}); }, 4000);
  }

  /* odczyt danych pacjenta po kodzie udostępnienia — z jawnym URL/kluczem
     (panel fizjoterapeuty z własnym projektem, tryb zaawansowany) */
  async function fetchByShareCode(url, anonKey, code) {
    url = String(url || '').trim().replace(/\/+$/, '');
    const res = await fetch(url + '/rest/v1/rpc/get_patient_by_code', {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: String(code || '').trim().toUpperCase() }),
    });
    if (!res.ok) throw new Error('Błąd połączenia (' + res.status + ')');
    const data = await res.json();
    if (!data) throw new Error('Nie znaleziono pacjenta o tym kodzie');
    return data;
  }

  /* jak wyżej, ale z wbudowanym projektem — jedyne co potrzebne to kod pacjenta */
  async function fetchByShareCodeBuiltIn(code) {
    if (!hasBuiltIn()) throw new Error('Brak wbudowanej konfiguracji Supabase');
    return fetchByShareCode(DEFAULT_URL, DEFAULT_ANON_KEY, code);
  }

  root.RFSync = {
    hasBuiltIn, configured, usingCustomProject, loggedIn, isAnonymous, email, shareCode, lastSyncAt,
    setConfig, signInAnonymously, requestCode, verifyCode, logout,
    push, pull, remoteIsNewer, markSynced, schedulePush,
    fetchByShareCode, fetchByShareCodeBuiltIn,
    _url: () => S.url || '', _anonKey: () => S.anonKey || '',
  };
})(typeof self !== 'undefined' ? self : this);
