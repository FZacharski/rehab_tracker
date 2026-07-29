# RehabFlow — synchronizacja przez Supabase (wariant 1)

Opcjonalna funkcja: **jeden przycisk** „Udostępnij fizjoterapeucie" —
pacjent nie zakłada konta, nie wpisuje e-maila, nie klika kodu z maila.
Aplikacja zakłada anonimowe konto w tle, wysyła dane i pokazuje link,
który pacjent po prostu przesyła fizjoterapeucie (Messenger, SMS —
przez systemowe „Udostępnij"). Fizjoterapeuta klika link i widzi podgląd
od razu, bez wpisywania czegokolwiek. Aplikacja działa w 100% bez tego —
sekcja „Synchronizacja" w Ustawieniach jest wyłączona, dopóki poniższe
kroki nie zostaną wykonane.

Osoby, które chcą mieć jedno konto na kilku swoich urządzeniach, mogą
dodatkowo zalogować się e-mailem w sekcji „Zaawansowane" (kod z maila,
jak poprzednio) — to opcja dodatkowa, nie wymagana do udostępniania.

## ⚠️ RODO — przeczytaj przed uruchomieniem

Dane rehabilitacyjne (ból, notatki, diagnoza) to **dane o zdrowiu**
(art. 9 RODO). Jeśli udostępniasz synchronizację innym osobom niż Ty sam:

- wybierz region UE przy tworzeniu projektu (np. `eu-central-1`),
- podpisz z Supabase DPA (Data Processing Addendum — w panelu:
  Organization → Legal Documents),
- poinformuj użytkowników, co jest przechowywane i gdzie
  (zaktualizuj `prywatnosc.html`).

Do użytku prywatnego (własne konto, własny fizjoterapeuta) wystarczy
region UE.

## Krok 1: projekt

1. https://supabase.com → New project (region **EU**, np. Frankfurt).
2. Zanotuj z Settings → API:
   - **Project URL** (np. `https://abcdefgh.supabase.co`)
   - **anon public key** (długi token `eyJ...`)
3. Wklej obie wartości do `rehab_pwa/sync.js`, na samej górze pliku:
   ```js
   const DEFAULT_URL = 'https://abcdefgh.supabase.co';
   const DEFAULT_ANON_KEY = 'eyJ...';
   ```
   Od tego momentu przycisk „Udostępnij fizjoterapeucie" w aplikacji
   i pole kodu w `fizjo.html` działają bez żadnej ręcznej konfiguracji
   po stronie użytkowników — commit + push wystarczy.

## Krok 2: baza danych

SQL Editor → wklej całość i uruchom:

```sql
-- stan pacjenta: jeden wiersz na użytkownika
create table public.patient_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  share_code text unique,
  updated_at timestamptz not null default now()
);

alter table public.patient_state enable row level security;

-- każdy użytkownik widzi i zapisuje wyłącznie własny wiersz
create policy "own_select" on public.patient_state
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.patient_state
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.patient_state
  for update using (auth.uid() = user_id);

-- podgląd dla fizjoterapeuty po 8-znakowym kodzie udostępnienia
-- (security definer omija RLS tylko dla tego jednego zapytania)
create or replace function public.get_patient_by_code(code text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select data from public.patient_state
  where share_code = upper(trim(code))
  limit 1;
$$;

revoke all on function public.get_patient_by_code(text) from public;
grant execute on function public.get_patient_by_code(text) to anon, authenticated;
```

**Odwoływanie dostępu.** Pacjent może w Ustawieniach wygenerować nowy kod
(`RFSync.regenerateShareCode()` — UPDATE `share_code`) albo całkiem wyłączyć
udostępnianie (`RFSync.stopSharing()` — UPDATE `share_code` na null i `data`
na `{}`). W obu przypadkach poprzedni link fizjoterapeuty natychmiast przestaje
cokolwiek znajdować, bo RPC szuka wyłącznie po `share_code`. Obie operacje
mieszczą się w polityce `own_update` — nie trzeba dodawać polityki DELETE.

## Krok 3: włącz logowanie anonimowe (klucz do jednego przycisku)

Authentication → Providers → **Anonymous Sign-Ins** → włącz.

Bez tego przycisk „Udostępnij fizjoterapeucie" zwróci błąd logowania —
to jedyny przełącznik, który trzeba kliknąć, żeby cały przepływ zaczął
działać.

## Krok 4 (opcjonalnie): logowanie kodem e-mail

Osoby korzystające z sekcji „Zaawansowane" logują się 6-cyfrowym kodem
(bez haseł, działa też w APK):

1. Authentication → Providers → **Email**: włączone (domyślnie jest).
2. Authentication → Email Templates → **Magic Link**: upewnij się, że
   treść zawiera `{{ .Token }}` (kod liczbowy), np.:
   `Twój kod logowania do RehabFlow: {{ .Token }}`
3. (Opcjonalnie) Authentication → Rate Limits — domyślne wystarczą.

## Krok 5: gotowe — jak to wygląda dla użytkowników

- **Pacjent**: Ustawienia → Synchronizacja → **🔗 Udostępnij fizjoterapeucie**
  → aplikacja zakłada anonimowe konto i wysyła dane w tle → pojawia się
  link → przycisk „📤 Wyślij link fizjoterapeucie" otwiera systemowe
  „Udostępnij" (Messenger, SMS, WhatsApp...). Dane wysyłają się
  automatycznie po każdej kolejnej zmianie.
- **Fizjoterapeuta**: klika link od pacjenta (`fizjo.html#kod=...`) —
  panel „Podgląd live" pobiera dane automatycznie, bez wpisywania
  czegokolwiek.
- **Synchronizacja między własnymi urządzeniami pacjenta** (opcjonalnie):
  Ustawienia → Synchronizacja → Zaawansowane → e-mail + kod z wiadomości
  (jak w poprzedniej wersji) — to osobne, pełne konto, niezależne od
  udostępniania anonimowego.

## Model bezpieczeństwa

- RLS: pacjent czyta/zapisuje wyłącznie własny wiersz (auth.uid()) —
  dotyczy to zarówno kont anonimowych, jak i logowania e-mailem
  (anonimowy użytkownik ma normalne `auth.users.id`, tylko bez adresu e-mail).
- Klucz anon jest publiczny z założenia — bez zalogowania nie daje
  dostępu do żadnych danych (poza RPC z poprawnym kodem pacjenta).
- Kod udostępnienia to sekret w stylu „tajnego linku" — 8 znaków
  z 32-znakowego alfabetu (~1,1 biliona kombinacji). Nie publikuj go.
- Konto anonimowe nie da się odzyskać po utracie danych przeglądarki
  (nie ma e-maila do zalogowania na innym urządzeniu) — to świadomy
  kompromis dla zerowej konfiguracji. Kto potrzebuje trwałego konta na
  kilku urządzeniach, użyje sekcji „Zaawansowane" (e-mail).
- Tokeny sesji przechowywane lokalnie na urządzeniu (localStorage),
  odświeżane automatycznie.
