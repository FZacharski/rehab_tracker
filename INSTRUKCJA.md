# 📱 RehabFlow v3.0 — Tracker Rehabilitacji

Nowoczesna aplikacja PWA do śledzenia 28-dniowego programu rehabilitacji.
Ciemny gradientowy design (granat → fiolet → róż), animacje, konfetti, odznaki i XP.

---

## 🌐 Aplikacja online

**https://fzacharski.github.io/rehab_tracker/**

Działa w każdej przeglądarce. Po pierwszym otwarciu działa też **offline**.

---

## 📲 Instalacja na telefonie (Android) — sposób 1: PWA (najprostszy)

1. Otwórz w **Chrome** na telefonie: `https://fzacharski.github.io/rehab_tracker/`
2. Pojawi się baner **„Zainstaluj"** — kliknij go
   (albo: menu ⋮ → **„Dodaj do ekranu głównego"** / **„Zainstaluj aplikację"**)
3. Gotowe — ikona RehabFlow pojawi się na ekranie głównym.
   Aplikacja otwiera się na pełnym ekranie, bez paska przeglądarki, działa offline.

### iPhone (Safari)
Przycisk **Udostępnij** → **„Dodaj do ekranu głównego"**.

---

## 📦 Instalacja na telefonie — sposób 2: plik APK

**Pobierz APK bezpośrednio na telefon:**

https://github.com/FZacharski/rehab_tracker/releases/download/v3.0.0/app-release-signed.apk

1. Otwórz powyższy link na telefonie (Android) i pobierz plik
2. Otwórz pobrany plik i zgódź się na instalację
   (telefon zapyta jednorazowo o zgodę na „instalację z nieznanych źródeł")
3. Gotowe — RehabFlow działa jak normalna aplikacja ze sklepu:
   pełny ekran bez paska adresu (Digital Asset Links skonfigurowane),
   własna ikona, działa offline.

Kopia pliku znajduje się też lokalnie w `twa-build/app-release-signed.apk`.

> Treść aplikacji ładuje się z GitHub Pages, więc poprawki publikowane w repo
> pojawiają się w aplikacji automatycznie — bez ponownej instalacji APK.

⚠️ **Ważne:** plik `twa-build/android.keystore` to klucz podpisujący aplikację.
Nie usuwaj go i nie udostępniaj — jest potrzebny do każdej przyszłej aktualizacji APK
(i do ewentualnej publikacji w Sklepie Play).

---

## 🚀 Aktualizacja aplikacji

1. Edytuj pliki (`index.html`, `manifest.json`, `sw.js`)
2. Podbij wersję cache w `sw.js` (np. `rehabflow-v3.0.1`)
3. `git add -A && git commit -m "opis" && git push`
4. Po 1-2 minutach zmiany są live — aplikacja na telefonie zaktualizuje się sama.

---

## 🏪 Publikacja w Sklepie Play (opcjonalnie, w przyszłości)

Wszystko jest gotowe — wystarczy:
1. Konto Google Play Console (25 USD jednorazowo): https://play.google.com/console
2. W `twa-build/` zbuduj pakiet AAB: `bubblewrap build` (powstaje `app-release-bundle.aab`)
3. Wgraj AAB w Play Console, uzupełnij opisy i grafiki
4. Nowe konta osobiste: wymagany test zamknięty (12 testerów / 14 dni) przed publikacją

---

## ✨ Funkcje

- ✅ Lista ćwiczeń z seriami/powtórzeniami (dodawanie, edycja, usuwanie)
- ✅ Odhaczanie z animacją, konfetti po ukończeniu dnia
- ✅ Suwaki bólu i trudności + notatki dzienne
- ✅ Kalendarz 28 dni z podglądem każdego dnia
- ✅ Wykresy postępu i poziomu bólu
- ✅ System XP, poziomy i 13 odznak
- ✅ Streak (dni z rzędu) z ochroną bieżącego dnia
- ✅ Ciemny i jasny motyw
- ✅ Przypomnienia (powiadomienia)
- ✅ Eksport / import danych JSON
- ✅ Pełne działanie offline

---

*RehabFlow v3.0 · dane przechowywane lokalnie na urządzeniu*
