# 📱 Tracker Rehabilitacji — Wersja Mobilna (PWA)

## Co to jest PWA?
Progressive Web App — strona internetowa działająca jak aplikacja mobilna.
Działa offline, można ją zainstalować na ekranie głównym telefonu.

---

## Jak uruchomić?

### Opcja A: Lokalnie na komputerze (udostępnienie przez Wi-Fi)

1. Upewnij się, że masz Python:
   ```
   py --version
   ```

2. Uruchom serwer:
   ```
   py -m http.server 8080
   ```

3. Sprawdź IP swojego komputera:
   - Windows: wpisz `ipconfig` w CMD → szukaj "Adres IPv4" (np. 192.168.1.10)

4. Na telefonie (podłączonym do tego samego Wi-Fi) otwórz przeglądarkę i wpisz:
   ```
   http://192.168.1.10:8080
   ```

5. Zainstaluj na ekranie głównym:
   - **Android (Chrome)**: menu ⋮ → "Dodaj do ekranu głównego"
   - **iPhone (Safari)**: przycisk Udostępnij → "Dodaj do ekranu głównego"

---

### Opcja B: GitHub Pages (dostęp z internetu, bezpłatnie)

1. Załóż konto na github.com
2. Utwórz nowe repozytorium (publiczne)
3. Wgraj wszystkie pliki z tego folderu
4. Wejdź w Settings → Pages → Branch: main → Save
5. Twoja aplikacja będzie pod adresem:
   `https://TWOJA_NAZWA.github.io/NAZWA_REPO`

---

### Opcja C: Netlify Drop (najłatwiejsza — 30 sekund)

1. Wejdź na https://app.netlify.com/drop
2. Przeciągnij cały folder `rehab_pwa` na stronę
3. Gotowe! Dostaniesz link, który otworzysz na telefonie

---

## Synchronizacja danych z wersją desktopową

Dane mobilne i desktopowe są oddzielne (każda wersja trzyma swoje dane).
Aby synchronizować:
- W aplikacji mobilnej: Postęp → **Eksportuj dane (JSON)**
- W aplikacji desktopowej: użyj tego pliku jako backup

---

## Funkcje wersji mobilnej

- ✅ Wszystkie funkcje wersji desktopowej
- ✅ Działa offline (po pierwszym wczytaniu)
- ✅ Instalacja na ekranie głównym (ikona jak normalna aplikacja)
- ✅ Dark mode
- ✅ Powiadomienia push (Android Chrome)
- ✅ Eksport/import danych JSON
- ✅ Interfejs zoptymalizowany pod dotyk

---

*Tracker Rehabilitacji v2.0 Mobile*
