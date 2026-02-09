# AI Summarizer - Wymagania Projektu

## Opis Projektu

Aplikacja webowa do automatycznego podsumowywania materiałów tekstowych według zasady Pareto (20/80) z eksportem do formatu Markdown.

## Cele Biznesowe

- Szybkie wyodrębnienie najważniejszych informacji z długich tekstów
- Oszczędność czasu użytkownika poprzez automatyczne podsumowania
- Łatwy eksport i dalsze wykorzystanie podsumowań
- Możliwość korzystania z różnych darmowych modeli AI poprzez OpenRouter

## Stack Technologiczny

### Backend
- **Python 3.9+**
- **Flask** - lekki framework webowy
- **OpenRouter API** - dostęp do darmowych modeli AI

### Frontend
- **HTML5** - struktura
- **CSS3** - stylowanie (możliwe użycie TailwindCSS CDN)
- **Vanilla JavaScript** - logika po stronie klienta
- *Brak React/Vue/Angular - maksymalna prostota*

### Narzędzia
- **pip** - zarządzanie zależnościami Python
- **venv** - wirtualne środowisko
- **git** - kontrola wersji

## Funkcjonalności MVP (Minimum Viable Product)

### F1: Odbiór Tekstu
**Priorytet:** MUST HAVE  
**Opis:** Użytkownik może wprowadzić tekst do przetworzenia

**Akceptacja:**
- Pole tekstowe (textarea) z minimalnym rozmiarem 500 znaków
- Licznik znaków pokazujący długość wprowadzonego tekstu
- Placeholder z przykładowym tekstem
- Walidacja: minimum 50 znaków, maksimum 50000 znaków

### F2: Podsumowanie AI według zasady 20/80
**Priorytet:** MUST HAVE  
**Opis:** System generuje podsumowanie zawierające 20% informacji o 80% wartości

**Akceptacja:**
- Integracja z OpenRouter API
- Prompt AI zawierający instrukcję zasady Pareto 20/80
- Obsługa błędów API (timeout, limit, błędny klucz)
- Loader/spinner podczas przetwarzania
- Wyświetlenie podsumowania w czytelnym formacie

**Prompt dla AI:**
```
Przeanalizuj poniższy tekst i wyodrębnij najważniejsze informacje według zasady Pareto 20/80.
Twoje podsumowanie powinno zawierać 20% treści, która reprezentuje 80% wartości i kluczowych wniosków.

Formatuj wynik w Markdown z:
- Nagłówkami (##) dla głównych sekcji
- Listami punktowanymi dla kluczowych punktów
- Pogrubieniem (**) dla najważniejszych terminów
- Krótkimi, treściwymi zdaniami

Tekst do analizy:
{user_text}
```

### F3: Eksport do Markdown
**Priorytet:** MUST HAVE  
**Opis:** Użytkownik może pobrać podsumowanie jako plik .md

**Akceptacja:**
- Przycisk "Pobierz jako .md"
- Automatyczne generowanie nazwy pliku: `summary_YYYYMMDD_HHMMSS.md`
- Prawidłowe formatowanie Markdown w pliku
- Podsumowanie zawiera metadata (data wygenerowania, długość oryginalnego tekstu)

**Format pliku:**
```markdown
# Podsumowanie

**Wygenerowano:** 2025-02-09 14:30:00  
**Długość oryginału:** 5234 znaki  
**Model AI:** [nazwa modelu]

---

[Treść podsumowania]
```

### F4: Wybór Modelu AI
**Priorytet:** SHOULD HAVE  
**Opis:** Użytkownik może wybrać model AI z listy dostępnych w OpenRouter

**Akceptacja:**
- Dropdown z listą modeli (minimum 3 darmowe modele)
- Domyślny model pre-wybrany
- Krótki opis każdego modelu (szybkość vs jakość)
- Zapisanie wyboru w localStorage przeglądarki

**Sugerowane modele darmowe:**
- `google/gemini-flash-1.5` - szybki, dobra jakość
- `meta-llama/llama-3.1-8b-instruct:free` - balans
- `nousresearch/hermes-3-llama-3.1-405b:free` - najwyższa jakość

### F5: Historia Podsumowań (Opcjonalne)
**Priorytet:** COULD HAVE  
**Opis:** System przechowuje ostatnie 10 podsumowań w localStorage

**Akceptacja:**
- Lista ostatnich podsumowań z datami
- Możliwość podglądu poprzedniego podsumowania
- Możliwość usunięcia pojedynczego wpisu
- Przycisk "Wyczyść historię"

## Kamienie Milowe

### Milestone 1: Podstawowa Infrastruktura (Czas: 1h)
**Deadline:** Dzień 1  
**Rezultat:** Działający szkielet aplikacji

**Zadania:**
- [x] Inicjalizacja projektu Python (venv, requirements.txt)
- [x] Struktura katalogów projektu
- [x] Podstawowy serwer Flask z jednym endpointem
- [x] Prosty HTML z formularzem
- [x] Test połączenia frontend-backend

**Weryfikacja:**
- Serwer uruchamia się bez błędów
- Formularz wysyła dane do backendu
- Backend zwraca odpowiedź

### Milestone 2: Integracja OpenRouter (Czas: 1.5h)
**Deadline:** Dzień 1  
**Rezultat:** Działające połączenie z API

**Zadania:**
- [x] Konfiguracja zmiennych środowiskowych (.env)
- [x] Implementacja klienta OpenRouter API
- [x] Endpoint `/api/summarize` z obsługą POST
- [x] Obsługa błędów i timeout
- [x] Testy ręczne z różnymi modelami

**Weryfikacja:**
- API zwraca podsumowanie dla przykładowego tekstu
- Błędy są prawidłowo obsługiwane
- Wszystkie 3 modele działają

### Milestone 3: UI i Eksport (Czas: 1h)
**Deadline:** Dzień 1  
**Rezultat:** Pełna funkcjonalność MVP

**Zadania:**
- [x] Stylowanie interfejsu (CSS/Tailwind)
- [x] Walidacja formularza
- [x] Loader podczas przetwarzania
- [x] Implementacja eksportu do .md
- [x] Licznik znaków
- [x] Responsywność podstawowa

**Weryfikacja:**
- Aplikacja wygląda profesjonalnie
- Wszystkie elementy są użyteczne
- Eksport działa poprawnie
- Działa na mobile i desktop

### Milestone 4: Optymalizacja i Testy (Czas: 30min)
**Deadline:** Dzień 1  
**Rezultat:** Stabilna, gotowa do użycia aplikacja

**Zadania:**
- [x] Testy end-to-end
- [x] Obsługa edge cases (puste pole, bardzo długi tekst)
- [x] Dokumentacja użytkownika (README.md)
- [x] Podstawowa dokumentacja kodu
- [x] Przygotowanie do deployment

**Weryfikacja:**
- Wszystkie funkcje MVP działają
- Brak błędów w konsoli
- README zawiera instrukcje uruchomienia

## Wymagania Niefunkcjonalne

### Wydajność
- Czas odpowiedzi API: maksymalnie 30 sekund
- Rozmiar strony: poniżej 500KB (bez zasobów CDN)
- Obsługa tekstów do 50000 znaków

### Bezpieczeństwo
- Klucz API OpenRouter w zmiennych środowiskowych (NIGDY w kodzie)
- Walidacja długości tekstu po stronie backendu
- Sanitacja inputu przed wysłaniem do API
- Rate limiting: maksymalnie 10 requestów na minutę na IP

### Użyteczność
- Intuicyjny interfejs - użytkownik wie co robić bez instrukcji
- Responsywny design - działa na urządzeniach 320px-1920px
- Komunikaty błędów zrozumiałe dla użytkownika
- Czas nauki: poniżej 2 minut dla nowego użytkownika

### Maintainability
- Kod zgodny z PEP 8 (Python)
- Komentarze dla złożonych sekcji
- Jasna struktura plików i katalogów
- README z instrukcjami uruchomienia i konfiguracji

## Struktura Plików

```
ai-summarizer/
│
├── backend/
│   ├── app.py                 # Główny plik Flask
│   ├── config.py              # Konfiguracja
│   ├── summarizer.py          # Logika podsumowywania
│   └── requirements.txt       # Zależności Python
│
├── frontend/
│   ├── index.html            # Główna strona
│   ├── styles.css            # Style
│   └── script.js             # Logika JS
│
├── .env.example              # Przykładowa konfiguracja
├── .gitignore               # Git ignore
├── README.md                # Dokumentacja projektu
├── REQUIREMENTS.md          # Ten dokument
└── AGENTS.md                # Instrukcje dla AI agentów
```

## Metryki Sukcesu

### Kryteria Akceptacji MVP
- ✅ Użytkownik może wkleić tekst i otrzymać podsumowanie
- ✅ Podsumowanie jest w formacie Markdown
- ✅ Użytkownik może pobrać plik .md
- ✅ Aplikacja działa z darmowymi modelami OpenRouter
- ✅ Czas implementacji: maksymalnie 4 godziny

### KPI
- **Czas od wklejenia do pobrania:** <45 sekund
- **Jakość podsumowania:** subiektywna ocena - czy zawiera kluczowe info
- **Stabilność:** 0 błędów krytycznych w 10 testach

## Przyszłe Rozszerzenia (Post-MVP)

### Faza 2 - Rozszerzone Funkcje
- Upload plików (.txt, .pdf, .docx)
- Różne style podsumowań (bullet points, esej, tldr)
- Eksport do PDF
- Dark mode
- Wielojęzyczność (EN, PL)

### Faza 3 - Zaawansowane
- Konta użytkowników
- Baza danych dla historii
- API dla integracji zewnętrznych
- Chrome extension
- Statystyki użycia

