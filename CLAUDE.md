# RehabFlow — kontekst projektu dla Claude

## Czym jest ten projekt

RehabFlow v3.0 — PWA do śledzenia 28-dniowego programu rehabilitacji (język UI: polski).
Funkcje: lista ćwiczeń (CRUD), odhaczanie z animacjami i konfetti, suwaki bólu/trudności,
notatki dzienne, kalendarz 28 dni, wykresy postępu, system XP/poziomów, 13 odznak, streak,
ciemny (domyślny) i jasny motyw, eksport/import JSON, działanie offline (service worker).

Design: ciemny granat z gradientami fiolet→róż (`#6366F1 → #A855F7 → #EC4899`),
font Outfit, animowane tło „aurora", glassmorphism.

## Architektura

- **Celowo brak bundlera i frameworka** — aplikacja to `index.html`
  (style + markup + vanilla JS) + `core.js` (czysta logika bez DOM: daty, streak,
  XP, statystyki — używana też przez testy), do tego `manifest.json`, `sw.js`, ikony PNG.
- Testy: `node --test tests/core.test.js` (bez zależności). CI: GitHub Actions
  (`.github/workflows/ci.yml`) uruchamia testy na push/PR.
- Nową logikę liczenia (daty/streak/XP/statystyki) dodawać do `core.js` jako czyste
  funkcje + test, nie do `index.html`.
- Dane wyłącznie w `localStorage` (klucz `rehabflow_v3`, migracja ze starego `rehab_pwa_v2`).
  Brak backendu.
- **Wszystkie ścieżki muszą być relatywne** (`./...`) — aplikacja jest hostowana
  w podkatalogu GitHub Pages. Nie używać ścieżek zaczynających się od `/`.
- Logika dat: klucze dni w formacie `YYYY-MM-DD` lokalnego czasu (funkcja `today()`).
- Treści użytkownika renderowane przez `esc()` — utrzymywać przy nowym kodzie.

## Deployment

- **PWA live:** https://fzacharski.github.io/rehab_tracker/
  (GitHub Pages, gałąź `master`, katalog główny; repo publiczne — wymóg darmowego Pages).
- Deploy = zwykły `git push origin master`; Pages buduje się 1-2 min.
- **Przy każdej zmianie aplikacji podbić wersję cache w `sw.js`** (np. `rehabflow-v3.0.1`),
  inaczej użytkownicy zobaczą starą wersję z cache.
- **APK (TWA/Bubblewrap):** GitHub Release v3.0.0 → `app-release-signed.apk`.
  Pakiet: `io.github.fzacharski.rehabflow`. APK ładuje treść z Pages, więc zmiany
  w aplikacji webowej trafiają do APK automatycznie — nowy APK potrzebny tylko przy
  zmianie ikony/nazwy/uprawnień.
- **Digital Asset Links:** repo `FZacharski/fzacharski.github.io` serwuje
  `.well-known/assetlinks.json` (+ `.nojekyll`). Odcisk SHA-256 certyfikatu musi się
  zgadzać z kluczem podpisującym APK.

## Czego sesja zdalna (chmurowa) NIE może

- **Nie może zbudować/podpisać APK** — keystore (`twa-build/android.keystore`,
  hasło w `twa-build/.keystore-password.txt`) istnieje tylko lokalnie na komputerze
  właściciela i celowo nie jest w repo. Folder `twa-build/` jest w `.gitignore`.
  NIGDY nie commitować keystore ani hasła.
- Może natomiast: edytować aplikację webową, pushować na `master` (= deploy),
  aktualizować dokumentację, tworzyć release'y bez assetów APK.

## Konwencje

- Komunikacja z użytkownikiem i komentarze: po polsku.
- Commity: krótki opis po polsku, bez polskich znaków diakrytycznych w treści commita.
- Styl kodu: dopasować się do istniejącego `index.html` (sekcje oznaczone `/* ══ ... ══ */`,
  zwięzły vanilla JS, brak zależności zewnętrznych poza Google Fonts).
- Testowanie lokalne: `py -m http.server 8123` i przeglądarka (mobile viewport 375px).

## Roadmapa uzgodniona z właścicielem (poziom komercyjny)

✅ ZROBIONE w v3.1 (czerwiec 2026):
- Biblioteka 47 gotowych ćwiczeń + szablony programów (kolano, bark, kręgosłup, kostka)
- Tryb „Rozpocznij trening" — sesja krok po kroku, licznik serii, timer przerw
  z dźwiękiem i wibracją
- Onboarding przy pierwszym uruchomieniu (imię, wybór programu, długość, przypomnienia)
- Edycja przeszłych dni (kalendarz i pasek dni → arkusz edycji)
- Raport dla fizjoterapeuty (okno wydruku → „Zapisz jako PDF"; celowo bez jsPDF,
  bo standardowe fonty jsPDF nie mają polskich znaków)
- Programy 2-8 tygodni, archiwum cykli, ekran ukończenia programu, nowy cykl
- Pomiary postępu (zakres ruchu/obwód/waga) z wykresem trendu
- Testy jednostkowe + CI, polityka prywatności (`prywatnosc.html`),
  najlepszy streak, podsumowanie tygodnia, duża czcionka, baner zaległych dni

POZOSTAŁO (duże decyzje, wymagają zgody właściciela):
- Capacitor zamiast TWA (natywne przypomnienia AlarmManager — obecne działają
  tylko przy otwartej aplikacji)
- Backup w chmurze (Supabase/Firebase — wymaga założenia konta przez właściciela)
- Wersja angielska (i18n — duży refaktor wszystkich tekstów UI)
- Publikacja w Google Play (konto 25 USD + test zamknięty 12 testerów/14 dni)
