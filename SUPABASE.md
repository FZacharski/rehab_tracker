# RehabFlow — synchronizacja przez Supabase (wariant 1)

Opcjonalna funkcja: konto pacjenta + synchronizacja między urządzeniami
+ podgląd live dla fizjoterapeuty (kod udostępnienia). Aplikacja działa
w 100% bez tego — sekcja „Synchronizacja" w Ustawieniach aktywuje się
dopiero po wpisaniu danych projektu.

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

## Krok 3: logowanie kodem e-mail

Aplikacja loguje 6-cyfrowym kodem (bez haseł, działa też w APK):

1. Authentication → Providers → **Email**: włączone (domyślnie jest).
2. Authentication → Email Templates → **Magic Link**: upewnij się, że
   treść zawiera `{{ .Token }}` (kod liczbowy), np.:
   `Twój kod logowania do RehabFlow: {{ .Token }}`
3. (Opcjonalnie) Authentication → Rate Limits — domyślne wystarczą.

## Krok 4: aktywacja w aplikacji

- **Pacjent**: Ustawienia → Synchronizacja → wklej Project URL i klucz
  anon → podaj e-mail → wpisz kod z wiadomości. Od tej chwili dane
  wysyłają się automatycznie po każdej zmianie, a przy starcie aplikacja
  pobiera nowszy stan z serwera (drugie urządzenie = ten sam e-mail).
- **Fizjoterapeuta**: pacjent podaje mu 8-znakowy kod udostępnienia
  (Ustawienia → Synchronizacja). Panel `fizjo.html` → sekcja
  „Podgląd live" → URL + klucz anon + kod pacjenta.

## Model bezpieczeństwa

- RLS: pacjent czyta/zapisuje wyłącznie własny wiersz (auth.uid()).
- Klucz anon jest publiczny z założenia — bez zalogowania nie daje
  dostępu do żadnych danych (poza RPC z poprawnym kodem pacjenta).
- Kod udostępnienia to sekret w stylu „tajnego linku" — 8 znaków
  z 32-znakowego alfabetu (~1,1 biliona kombinacji). Nie publikuj go.
- Tokeny sesji przechowywane lokalnie na urządzeniu (localStorage),
  odświeżane automatycznie.
