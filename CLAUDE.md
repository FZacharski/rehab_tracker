# RehabFlow — kontekst projektu dla Claude

## Czym jest ten projekt

RehabFlow v3.0 — PWA do śledzenia 28-dniowego programu rehabilitacji (język UI: polski).
Funkcje: lista ćwiczeń (CRUD), odhaczanie z animacjami i konfetti, suwaki bólu/trudności,
notatki dzienne, kalendarz 28 dni, wykresy postępu, system XP/poziomów, 13 odznak, streak,
ciemny (domyślny) i jasny motyw, eksport/import JSON, działanie offline (service worker).

Design: ciemny granat z gradientami fiolet→róż (`#6366F1 → #A855F7 → #EC4899`),
font Outfit, animowane tło „aurora", glassmorphism.

## Architektura

- **Celowo brak bundlera i frameworka** — cała aplikacja to jeden plik `index.html`
  (style + markup + vanilla JS), do tego `manifest.json`, `sw.js`, ikony PNG.
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

Priorytet 1 (do zrobienia w obecnej architekturze, bez backendu):
1. Biblioteka gotowych ćwiczeń + szablony programów (kolano, bark, kręgosłup, kostka)
2. Tryb „Rozpocznij trening" — sesja krok po kroku, licznik serii, timer przerw z wibracją
3. Onboarding przy pierwszym uruchomieniu (imię, wybór programu, godziny przypomnień)
4. Edycja przeszłych dni z poziomu kalendarza (uzupełnianie zapomnianych odhaczeń)

Priorytet 2: raport PDF dla fizjoterapeuty (jsPDF), programy dłuższe niż 28 dni,
archiwum cykli, pomiary postępu z trendami.

Priorytet 3 (duże decyzje, wymagają zgody właściciela): Capacitor zamiast TWA
(natywne przypomnienia AlarmManager), backup w chmurze (Supabase/Firebase),
rozbicie na moduły + Vite + testy + CI, polityka prywatności pod Google Play.
