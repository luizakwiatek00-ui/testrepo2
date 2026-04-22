# TODO — Meeting Cost App

## 1. Struktura projektu

- [ ] Utwórz `index.html` — szkielet aplikacji z trzema widokami
- [ ] Utwórz `style.css` — plik stylów (mobile-first)
- [ ] Utwórz `app.js` — plik logiki aplikacji

---

## 2. Widok główny (View 1 — Main)

- [ ] Kafelki ról z przyciskami +/−
- [ ] Wyświetlanie aktualnej liczby uczestników przy każdej roli
- [ ] Podgląd łącznego kosztu godzinowego pod kafelkami
- [ ] Przycisk **Start** przyklejony na dole ekranu (sticky)

---

## 3. Widok aktywnego spotkania (View 2 — Active)

- [ ] Duży wyświetlacz bieżącego kosztu (główny element)
- [ ] Licznik czasu (elapsed time)
- [ ] Małe statystyki: liczba uczestników, stawka godzinowa
- [ ] Przyciski **Pauza / Wznów** i **Reset**

---

## 4. Logika timera

- [ ] Implementacja stanu: `startTime`, `pausedAt`, `totalPausedMs`, `isRunning`
- [ ] Obsługa akcji: Start, Pauza, Wznów, Reset
- [ ] Pętla renderująca co ~250–500 ms (`setInterval`)
- [ ] Obliczanie czasu wyłącznie z timestampów (`Date.now()`)

---

## 5. Obliczanie kosztu

- [ ] Funkcja `getTotalHourlyRate()` — suma `rate × count` dla każdej roli
- [ ] Funkcja `getElapsedMs()` — czas z uwzględnieniem pauz
- [ ] Funkcja `getMeetingCost()` — koszt w oparciu o stawkę i czas
- [ ] Aktualizacja wyświetlacza przy każdym ticku pętli

---

## 6. Zarządzanie rolami

- [ ] Domyślne role: Manager (120), Senior (100), Mid (70), Junior (50)
- [ ] Inkrementacja i dekrementacja liczby uczestników (min. 0)
- [ ] Blokada dekrementacji poniżej 0

---

## 7. Widok ustawień (View 3 — Settings)

- [ ] Edycja nazw ról
- [ ] Edycja stawek godzinowych
- [ ] Wybór waluty: PLN / EUR / USD
- [ ] Przycisk powrotu do widoku głównego

---

## 8. localStorage

- [ ] Zapis ról (`meetingCost:roles`) przy każdej zmianie
- [ ] Zapis ustawień (`meetingCost:settings`) przy każdej zmianie
- [ ] Odczyt danych przy starcie aplikacji
- [ ] Fallback do wartości domyślnych gdy brak danych w storage

---

## 9. Formatowanie waluty

- [ ] Implementacja `Intl.NumberFormat` dla PLN, EUR, USD
- [ ] Dynamiczna zmiana formatu po zmianie waluty w ustawieniach

---

## 10. Style i UX mobilny

- [ ] Layout jednokolumnowy, mobile-first
- [ ] Przyciski o min. rozmiarze 44×44px (thumb-friendly)
- [ ] Font size ≥ 16px (zapobiega zoomowi na iOS)
- [ ] Brak efektów hover
- [ ] Wysoki kontrast
- [ ] Sticky przycisk Start na dole ekranu
- [ ] Responsywność na desktop (secondary target)

---

## 11. Hosting (GitHub Pages)

- [ ] Włącz GitHub Pages dla repozytorium (branch `main`, folder `/root`)
- [ ] Sprawdź działanie na Safari iPhone
- [ ] Sprawdź działanie na desktop (Chrome, Firefox)

---

## 12. Testy manualne

- [ ] Start → koszt rośnie w czasie rzeczywistym
- [ ] Pauza → koszt zatrzymany, czas nie biegnie
- [ ] Wznów → koszt kontynuuje od momentu pauzy
- [ ] Reset → wszystko wraca do zera
- [ ] Odświeżenie strony → dane ról zachowane z localStorage
- [ ] Zmiana waluty → koszt przelicza się poprawnie
- [ ] Ustawienie 0 uczestników → koszt = 0
