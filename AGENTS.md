# AGENTS.md - Instrukcje dla AI Agentów

## Cel Dokumentu

Ten dokument zawiera szczegółowe instrukcje dla AI agentów (Claude, ChatGPT, etc.) pracujących nad projektem AI Summarizer. Zapewnia kontekst, konwencje i best practices dla efektywnej współpracy.

## Przegląd Projektu

**Nazwa:** AI Summarizer  
**Typ:** Aplikacja webowa (Flask + Vanilla JS)  
**Cel:** Podsumowywanie tekstów według zasady Pareto 20/80 z eksportem do Markdown  
**Stack:** Python (Flask) + HTML/CSS/JS + OpenRouter API  
**Poziom:** MVP - maksymalna prostota, czas implementacji: 3-4h

## Kontekst Biznesowy

Developer tworzy swoją pierwszą prostą aplikację webową:
- **Doświadczenie:** Zna Python, NIE ZNA frontend (React/Vue/Angular)
- **Ograniczenie czasowe:** Maksymalnie kilka godzin
- **Priorytet:** Działająca aplikacja, nie piękny kod
- **Deployment:** Lokalnie lub prosty hosting (np. Replit, PythonAnywhere)

## Zasady Pracy z Developerem

### DO:
✅ Proponuj najprostsze możliwe rozwiązania  
✅ Używaj vanilla JavaScript, NIE frameworków frontend  
✅ Generuj kompletny, działający kod bez abstrakcji  
✅ Wyjaśniaj co robi każda sekcja kodu  
✅ Zawsze pokazuj jak zainstalować zależności  
✅ Testuj rozwiązania przed podaniem (jeśli możliwe)  
✅ Używaj polskich komentarzy w kodzie (developer jest Polakiem)  
✅ Podawaj gotowe do skopiowania bloki kodu  

### DON'T:
❌ NIE sugeruj React, Vue, Angular, Next.js  
❌ NIE twórz skomplikowanych architektur  
❌ NIE używaj TypeScript  
❌ NIE proponuj mikroserwisów, Docker bez wyraźnej potrzeby  
❌ NIE zakładaj znajomości zaawansowanych konceptów web dev  
❌ NIE używaj skrótów "..." w kodzie - zawsze pełny listing  

## Stack Technologiczny - Szczegóły

### Backend (Python)

**Framework:** Flask (najprostszy)  
**Wersja Python:** 3.9+  
**Główne biblioteki:**
- `flask` - serwer webowy
- `python-dotenv` - zarządzanie zmiennymi środowiskowymi
- `requests` - HTTP client dla OpenRouter API
- `flask-cors` - obsługa CORS (opcjonalnie)

**Struktura plików:**
```
backend/
├── app.py              # Główny plik - Flask app, routing
├── config.py           # Konfiguracja (API keys z .env)
├── summarizer.py       # Logika podsumowywania i komunikacji z OpenRouter
└── requirements.txt    # Zależności
```

**Przykład requirements.txt:**
```
flask==3.0.0
python-dotenv==1.0.0
requests==2.31.0
flask-cors==4.0.0
```

### Frontend (Vanilla)

**Technologie:** HTML5 + CSS3 + Vanilla JavaScript  
**Stylowanie:** Możliwe użycie TailwindCSS z CDN (opcjonalnie)  
**NIE używamy:** React, Vue, Angular, jQuery, Bootstrap

**Struktura plików:**
```
frontend/
├── index.html      # Główna strona - cała aplikacja SPA
├── styles.css      # Custom CSS (lub używamy tylko Tailwind)
└── script.js       # Cała logika JS - AJAX, walidacja, eksport
```

### API (OpenRouter)

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`  
**Autentykacja:** Bearer token w nagłówku  
**Format:** OpenAI-compatible API

**Konfiguracja:**
```python
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
```

**Darmowe modele do użycia:**
1. `google/gemini-flash-1.5` - szybki, dobry balans
2. `meta-llama/llama-3.1-8b-instruct:free` - średnia prędkość
3. `nousresearch/hermes-3-llama-3.1-405b:free` - najlepsza jakość

## Implementacja Kluczowych Funkcji

### 1. Połączenie z OpenRouter API

**Lokalizacja:** `backend/summarizer.py`

**Wymagania:**
- Obsługa timeout (30 sekund)
- Proper error handling
- Struktura zgodna z OpenAI API
- Logowanie błędów

**Przykładowa implementacja:**
```python
import requests
import os
from typing import Dict, Optional

class Summarizer:
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.base_url = 'https://openrouter.ai/api/v1/chat/completions'
        
    def summarize(self, text: str, model: str = 'google/gemini-flash-1.5') -> Dict:
        """
        Podsumowuje tekst używając wybranego modelu AI.
        
        Args:
            text: Tekst do podsumowania
            model: Identyfikator modelu OpenRouter
            
        Returns:
            Dict z kluczami: success, summary (lub error)
        """
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
        
        prompt = f"""Przeanalizuj poniższy tekst i wyodrębnij najważniejsze informacje według zasady Pareto 20/80.
Twoje podsumowanie powinno zawierać 20% treści, która reprezentuje 80% wartości i kluczowych wniosków.

Formatuj wynik w Markdown z:
- Nagłówkami (##) dla głównych sekcji
- Listami punktowanymi dla kluczowych punktów
- Pogrubieniem (**) dla najważniejszych terminów
- Krótkimi, treściwymi zdaniami

Tekst do analizy:

{text}"""

        payload = {
            'model': model,
            'messages': [
                {'role': 'user', 'content': prompt}
            ]
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            summary = result['choices'][0]['message']['content']
            
            return {
                'success': True,
                'summary': summary,
                'model': model
            }
            
        except requests.exceptions.Timeout:
            return {'success': False, 'error': 'Przekroczono limit czasu oczekiwania'}
        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': f'Błąd połączenia z API: {str(e)}'}
        except KeyError:
            return {'success': False, 'error': 'Nieprawidłowa odpowiedź z API'}
```

### 2. Flask Routes

**Lokalizacja:** `backend/app.py`

**Główne endpointy:**
- `GET /` - serwuje frontend (index.html)
- `POST /api/summarize` - główna logika podsumowywania
- `GET /api/models` - lista dostępnych modeli (opcjonalnie)

**Przykład:**
```python
from flask import Flask, request, jsonify, send_from_directory
from summarizer import Summarizer
import os

app = Flask(__name__, static_folder='../frontend')
summarizer = Summarizer()

@app.route('/')
def index():
    """Serwuje główną stronę aplikacji"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """
    Endpoint do podsumowywania tekstu.
    
    Expects JSON: {
        "text": "tekst do podsumowania",
        "model": "nazwa-modelu" (opcjonalnie)
    }
    
    Returns JSON: {
        "success": true/false,
        "summary": "podsumowanie" (jeśli success),
        "error": "komunikat błędu" (jeśli failure)
    }
    """
    data = request.get_json()
    
    # Walidacja
    if not data or 'text' not in data:
        return jsonify({'success': False, 'error': 'Brak tekstu do podsumowania'}), 400
    
    text = data['text'].strip()
    
    if len(text) < 50:
        return jsonify({'success': False, 'error': 'Tekst jest za krótki (minimum 50 znaków)'}), 400
    
    if len(text) > 50000:
        return jsonify({'success': False, 'error': 'Tekst jest za długi (maksimum 50000 znaków)'}), 400
    
    model = data.get('model', 'google/gemini-flash-1.5')
    
    # Podsumowanie
    result = summarizer.summarize(text, model)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 3. Frontend - Formularz i Logika

**Lokalizacja:** `frontend/index.html` i `frontend/script.js`

**Kluczowe funkcje:**
- Walidacja po stronie klienta
- Loader podczas przetwarzania
- Eksport do .md
- Licznik znaków

**Przykład script.js:**
```javascript
// Główna logika aplikacji
const API_URL = 'http://localhost:5000/api';

// Elementy DOM
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById('submitBtn');
const resultContainer = document.getElementById('resultContainer');
const summaryContent = document.getElementById('summaryContent');
const downloadBtn = document.getElementById('downloadBtn');
const loader = document.getElementById('loader');

// Licznik znaków
textInput.addEventListener('input', () => {
    const length = textInput.value.length;
    charCount.textContent = `${length} znaków`;
    
    // Walidacja wizualna
    if (length < 50) {
        charCount.style.color = 'red';
    } else if (length > 50000) {
        charCount.style.color = 'red';
    } else {
        charCount.style.color = 'green';
    }
});

// Główna funkcja podsumowywania
async function summarizeText() {
    const text = textInput.value.trim();
    
    // Walidacja
    if (text.length < 50) {
        alert('Tekst musi mieć minimum 50 znaków');
        return;
    }
    
    if (text.length > 50000) {
        alert('Tekst może mieć maksymalnie 50000 znaków');
        return;
    }
    
    // Pokaż loader
    loader.style.display = 'block';
    submitBtn.disabled = true;
    resultContainer.style.display = 'none';
    
    try {
        const response = await fetch(`${API_URL}/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model: document.getElementById('modelSelect').value
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Wyświetl podsumowanie
            summaryContent.innerHTML = marked.parse(data.summary); // używamy marked.js do renderowania MD
            resultContainer.style.display = 'block';
            
            // Zapisz do eksportu
            window.currentSummary = data.summary;
            window.currentModel = data.model;
        } else {
            alert(`Błąd: ${data.error}`);
        }
        
    } catch (error) {
        alert(`Błąd połączenia: ${error.message}`);
    } finally {
        loader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Eksport do .md
function downloadMarkdown() {
    if (!window.currentSummary) {
        alert('Brak podsumowania do pobrania');
        return;
    }
    
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `summary_${timestamp}.md`;
    
    const content = `# Podsumowanie

**Wygenerowano:** ${now.toLocaleString('pl-PL')}
**Długość oryginału:** ${textInput.value.length} znaków
**Model AI:** ${window.currentModel}

---

${window.currentSummary}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Event listeners
submitBtn.addEventListener('click', summarizeText);
downloadBtn.addEventListener('click', downloadMarkdown);
```

## Konfiguracja i Deployment

### Zmienne Środowiskowe

**Plik:** `.env` (w głównym katalogu)

```env
# OpenRouter API
OPENROUTER_API_KEY=your_api_key_here

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
```

**WAŻNE:** Zawsze twórz `.env.example` bez prawdziwych kluczy!

### Uruchomienie Lokalne

**Kroki:**
```bash
# 1. Stwórz wirtualne środowisko
python -m venv venv

# 2. Aktywuj (Linux/Mac)
source venv/bin/activate

# 3. Aktywuj (Windows)
venv\Scripts\activate

# 4. Zainstaluj zależności
pip install -r backend/requirements.txt

# 5. Ustaw zmienne środowiskowe
cp .env.example .env
# EDYTUJ .env i dodaj swój klucz API!

# 6. Uruchom serwer
python backend/app.py

# 7. Otwórz przeglądarkę
# http://localhost:5000
```

### Prosty Deployment

**Opcja 1: Replit**
- Wrzuć cały projekt do Replit
- Dodaj secret: `OPENROUTER_API_KEY`
- Replit automatycznie wykryje Flask i uruchomi

**Opcja 2: PythonAnywhere**
- Upload plików przez Files
- Stwórz Web app (Flask)
- Ustaw env variables w Web tab
- Reload aplikacji

## Standardy Kodowania

### Python (PEP 8)

```python
# Dobre praktyki:

# 1. Type hints
def summarize(text: str, model: str = 'default') -> Dict[str, Any]:
    pass

# 2. Docstringi
def function():
    """
    Krótki opis.
    
    Args:
        param: opis
    
    Returns:
        opis
    """
    pass

# 3. Nazewnictwo
CONSTANT_VALUE = 'value'  # Stałe - wielkie litery
class MyClass:            # Klasy - PascalCase
def my_function():        # Funkcje - snake_case
variable_name = 123       # Zmienne - snake_case

# 4. Error handling
try:
    risky_operation()
except SpecificException as e:
    logger.error(f'Błąd: {e}')
    return {'error': str(e)}
```

### JavaScript

```javascript
// 1. Używaj const/let, NIE var
const API_URL = 'http://localhost:5000';
let counter = 0;

// 2. Arrow functions dla callbacks
elements.forEach(el => {
    console.log(el);
});

// 3. Async/await zamiast callbacks
async function fetchData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

// 4. Destructuring
const { success, summary } = response.data;

// 5. Template literals
const message = `Witaj ${name}, masz ${count} wiadomości`;
```

## Obsługa Błędów - Best Practices

### Backend

```python
# ZAWSZE obsługuj konkretne wyjątki
try:
    response = requests.post(url, json=data, timeout=30)
    response.raise_for_status()
except requests.exceptions.Timeout:
    return {'error': 'Timeout - spróbuj ponownie'}
except requests.exceptions.ConnectionError:
    return {'error': 'Brak połączenia z internetem'}
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 401:
        return {'error': 'Nieprawidłowy klucz API'}
    elif e.response.status_code == 429:
        return {'error': 'Przekroczono limit requestów'}
    else:
        return {'error': f'Błąd HTTP: {e.response.status_code}'}
except Exception as e:
    # Ostatnia deska ratunku
    logger.exception('Nieoczekiwany błąd')
    return {'error': 'Wystąpił nieoczekiwany błąd'}
```

### Frontend

```javascript
// Zawsze używaj try-catch z async/await
try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
} catch (error) {
    if (error.message.includes('Failed to fetch')) {
        alert('Brak połączenia z serwerem. Czy backend działa?');
    } else {
        alert(`Błąd: ${error.message}`);
    }
    console.error('Szczegóły błędu:', error);
}
```

## Testowanie

### Scenariusze Testowe

**Test 1: Happy Path**
1. Wklej tekst (1000 znaków)
2. Wybierz model
3. Kliknij "Podsumuj"
4. Sprawdź czy podsumowanie się wyświetla
5. Pobierz jako .md
6. Sprawdź zawartość pliku

**Test 2: Walidacja**
1. Wklej 20 znaków → Powinien pokazać błąd
2. Wklej 60000 znaków → Powinien pokazać błąd
3. Kliknij "Podsumuj" bez tekstu → Powinien pokazać błąd

**Test 3: Error Handling**
1. Wyłącz internet → Powinien pokazać błąd połączenia
2. Użyj nieprawidłowego klucza API → Powinien pokazać błąd autentykacji
3. Symuluj timeout → Powinien pokazać błąd timeout

## Częste Problemy i Rozwiązania

### Problem: CORS Error

**Objaw:** Błąd w konsoli przeglądarki: "Access-Control-Allow-Origin"

**Rozwiązanie:**
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Dodaj to zaraz po utworzeniu app
```

### Problem: OpenRouter zwraca 401

**Możliwe przyczyny:**
1. Nieprawidłowy klucz API
2. Brak klucza w nagłówku
3. Klucz wygasł

**Rozwiązanie:**
```python
# Sprawdź czy klucz jest wczytany
print(f"API Key loaded: {os.getenv('OPENROUTER_API_KEY')[:10]}...")

# Upewnij się że headers są poprawne
headers = {
    'Authorization': f'Bearer {self.api_key}',  # Uwaga na format!
    'Content-Type': 'application/json',
}
```

### Problem: Markdown nie renderuje się

**Rozwiązanie:** Dodaj bibliotekę marked.js w HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

I użyj:
```javascript
summaryContent.innerHTML = marked.parse(data.summary);
```

## Komunikacja z Developerem

### Format Odpowiedzi na Pytania

**Gdy developer pyta o problem:**

1. **Zdiagnozuj:** "Najprawdopodobniej problem jest w..."
2. **Wyjaśnij:** "Dzieje się tak, ponieważ..."
3. **Pokaż rozwiązanie:** Konkretny kod do skopiowania
4. **Weryfikacja:** "Sprawdź czy to działa przez..."

**Przykład:**
```
Developer: "Dostaję błąd 500 gdy klikam Podsumuj"

Agent: 
1. Najprawdopodobniej problem jest w endpoint `/api/summarize` - backend nie radzi sobie z requestem.

2. Sprawdź logi Flask - prawdopodobnie zobaczysz stack trace pokazujący dokładnie co poszło nie tak.

3. Najczęstsze przyczyny tego błędu:
   - Brak klucza API w .env
   - Nieprawidłowy format JSON w requeście
   - Problem z deserializacją odpowiedzi z OpenRouter

4. Dodaj tymczasowo więcej logowania:

```python
@app.route('/api/summarize', methods=['POST'])
def summarize():
    print("=== DEBUG START ===")
    data = request.get_json()
    print(f"Otrzymano dane: {data}")
    
    result = summarizer.summarize(data['text'])
    print(f"Wynik: {result}")
    print("=== DEBUG END ===")
    
    return jsonify(result)
```

5. Uruchom ponownie i sprawdź terminal - powinieneś zobaczyć szczegóły.
```

## Checklisty dla Różnych Zadań

### Checklist: Dodanie Nowej Funkcji

- [ ] Zaktualizuj REQUIREMENTS.md
- [ ] Dodaj endpoint w backend/app.py (jeśli potrzebny)
- [ ] Dodaj logikę w odpowiednim module
- [ ] Dodaj UI w frontend/index.html
- [ ] Dodaj JS logikę w frontend/script.js
- [ ] Przetestuj manualnie
- [ ] Zaktualizuj README.md
- [ ] Commit z opisowym message

### Checklist: Debugging

- [ ] Sprawdź logi backend (terminal z Flask)
- [ ] Sprawdź Console w przeglądarce (F12)
- [ ] Sprawdź Network tab - czy requesty dochodzą?
- [ ] Zweryfikuj .env - czy klucz API jest OK?
- [ ] Sprawdź czy wszystkie dependencies są zainstalowane
- [ ] Spróbuj curl/Postman do testowania API bezpośrednio

## Przykładowe Prompty dla Developera

**Gdy developer chce dodać funkcję:**
```
"Chcę dodać możliwość wyboru długości podsumowania (krótkie/średnie/długie). 
Jak to zaimplementować najprościej?"
```

**Odpowiedź agenta powinna zawierać:**
1. Modyfikację promptu AI z parametrem długości
2. Dodanie dropdown w HTML
3. Przekazanie parametru przez JS do backend
4. Przykład kompletnego kodu

## Zasady Bezpieczeństwa

### NIGDY nie commituj:
- `.env` z prawdziwymi kluczami
- Plików z hasłami
- Wrażliwych danych użytkowników

### ZAWSZE:
- Waliduj input po stronie backendu
- Używaj HTTPS w produkcji
- Implementuj rate limiting
- Sanityzuj dane przed wyświetleniem

### W tym projekcie MVP:
- Klucz API tylko w .env (NIGDY w kodzie)
- Rate limiting: max 10 req/min (można dodać z flask-limiter)
- Input validation: długość tekstu, type checking
- Brak przechowywania danych użytkowników (stateless)

## Kontakt i Rozwój

**Dla AI Agentów:**
- Zawsze sprawdzaj najnowszą wersję REQUIREMENTS.md przed implementacją
- W razie wątpliwości pytaj developera o priorytet
- Proponuj ulepszenia, ale szanuj zasadę prostoty
- Dokumentuj każdą istotną decyzję architektoniczną

**Dla Developera:**
- Aktualizuj ten dokument gdy zmieniasz założenia projektu
- Dodawaj nowe sekcje gdy odkrywasz recurring problems
- Share lessons learned

---

**Wersja:** 1.0  
**Data utworzenia:** 2025-02-09  
**Ostatnia aktualizacja:** 2025-02-09  
**Następny review:** Po zakończeniu MVP
