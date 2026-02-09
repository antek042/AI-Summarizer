# Backend Architecture - Prosty Blueprint

## Struktura Plików

```
backend/
├── app.py              # Flask routing (50 linii)
├── summarizer.py       # OpenRouter API logic (70 linii)  
└── requirements.txt    # 3 dependencies
```

---

## app.py - Routing

**Odpowiedzialność:** HTTP in/out, walidacja

```python
from flask import Flask, request, jsonify, send_from_directory
from summarizer import SummarizerService
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__, static_folder='../frontend')
summarizer = SummarizerService()

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    
    # Walidacja
    if not data or 'text' not in data:
        return jsonify({'error': 'Brak tekstu'}), 400
    
    text = data['text']
    if len(text) < 50:
        return jsonify({'error': 'Tekst za krótki (minimum 50 znaków)'}), 400
    if len(text) > 50000:
        return jsonify({'error': 'Tekst za długi (maksimum 50000 znaków)'}), 400
    
    model = data.get('model')  # optional
    
    # Wywołanie service
    try:
        summary = summarizer.summarize(text, model)
        return jsonify({'summary': summary}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

**To prawie cały plik. ~50 linii.**

---

## summarizer.py - Business Logic

**Odpowiedzialność:** OpenRouter API, prompt, errors

```python
import requests
import os

class SummarizerService:
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.api_url = 'https://openrouter.ai/api/v1/chat/completions'
        self.default_model = os.getenv('DEFAULT_MODEL', 'google/gemini-flash-1.5')
    
    def summarize(self, text: str, model: str = None) -> str:
        """Podsumowuje tekst używając AI"""
        if not self.api_key:
            raise Exception('Brak OPENROUTER_API_KEY w zmiennych środowiskowych')
        
        if model is None:
            model = self.default_model
        
        # Prompt
        prompt = f"""Przeanalizuj poniższy tekst i wyodrębnij najważniejsze informacje według zasady Pareto 20/80.

Twoje podsumowanie powinno zawierać 20% treści, która reprezentuje 80% wartości i kluczowych wniosków.

Formatuj wynik w Markdown:
- Nagłówki (##) dla głównych sekcji
- Listy punktowane dla kluczowych punktów
- Pogrubienie (**) dla najważniejszych terminów
- Krótkie, treściwe zdania

Tekst do analizy:

{text}"""
        
        payload = {
            'model': model,
            'messages': [
                {'role': 'user', 'content': prompt}
            ]
        }
        
        # API call
        response_data = self._call_api(payload)
        return response_data['choices'][0]['message']['content']
    
    def _call_api(self, payload: dict) -> dict:
        """Wywołanie OpenRouter API"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
        
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            raise Exception('Przekroczono czas oczekiwania')
        except requests.exceptions.RequestException as e:
            raise Exception(f'Błąd API: {str(e)}')
```

**To cały plik. ~70 linii.**

---

## requirements.txt

```
flask==3.0.0
python-dotenv==1.0.0
requests==2.31.0
```

**3 linie.**

---

## .env

```
OPENROUTER_API_KEY=sk-or-v1-...
DEFAULT_MODEL=google/gemini-flash-1.5
```

---

## Flow: Request → Response

```
User klika "Podsumuj"
    ↓
Frontend: POST /api/summarize {"text": "...", "model": "..."}
    ↓
app.py: Walidacja (długość tekstu)
    ↓
app.py: summarizer.summarize(text, model)
    ↓
summarizer.py: Buduje prompt
    ↓
summarizer.py: _call_api() → OpenRouter
    ↓
OpenRouter: [AI processing 5-20s]
    ↓
summarizer.py: Zwraca summary string
    ↓
app.py: jsonify({'summary': summary}), 200
    ↓
Frontend: Wyświetla podsumowanie
```

---

## Kluczowe Decyzje

### 1. Walidacja w app.py
**Dlaczego?** Szybkie odrzucenie złych requestów, service dostaje clean data.

### 2. Service rzuca Exceptions
**Dlaczego?** Pythonic, route łapie i formatuje do HTTP.

### 3. Prompt hardcoded
**Dlaczego?** Łatwe testowanie, widoczne w kodzie, Git history.

### 4. Model optional
**Dlaczego?** Prostsze dla usera, default z .env.

### 5. Timeout 30s
**Dlaczego?** OpenRouter processing ~5-20s, buffer na network.

### 6. Brak retry
**Dlaczego?** MVP prostota, można dodać później.

### 7. Logging: print() tylko błędów
**Dlaczego?** Console wystarczy, zero konfiguracji.

---

## Instalacja i Uruchomienie

```bash
# 1. Virtual env
python -m venv venv
source venv/bin/activate  # Linux/Mac
# lub: venv\Scripts\activate  # Windows

# 2. Install deps
pip install -r backend/requirements.txt

# 3. Configure
cp .env.example .env
# Edytuj .env - dodaj OPENROUTER_API_KEY

# 4. Run
python backend/app.py

# 5. Test
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Long text here (min 50 chars)..."}'
```

---

## Możliwe Problemy

### Problem: "Brak OPENROUTER_API_KEY"
**Fix:** Sprawdź .env, upewnij się że `load_dotenv()` jest wywołane.

### Problem: Timeout
**Fix:** Sprawdź internet, spróbuj krótszego tekstu.

### Problem: 401 Unauthorized
**Fix:** Nieprawidłowy API key, wygeneruj nowy na openrouter.ai

### Problem: CORS error
**Fix:** Nie powinno wystąpić (backend serwuje frontend), ale jeśli: dodaj flask-cors

---

## Rozbudowa (Post-MVP)

**Łatwe do dodania:**
- Retry logic (1 retry dla timeout)
- Szczegółowe error messages (różne dla 401, 429, 503)
- Metadata w response (model, czas przetwarzania)
- Logging do pliku
- Rate limiting

**Wymaga refactoringu:**
- Multiple styles (quick/detailed/technical)
- Caching podsumowań
- User accounts
- Database dla historii

---

## Total Code Stats

| Plik | Linie | Odpowiedzialność |
|------|-------|------------------|
| app.py | ~50 | HTTP routing, walidacja |
| summarizer.py | ~70 | AI API logic |
| requirements.txt | 3 | Dependencies |
| **Total** | **~120** | **Complete backend** |

**Time to implement:** 1.5-2h włącznie z testowaniem

---

## Podsumowanie

To jest **cały backend**. Nic więcej nie potrzebujesz dla MVP.

- 2 pliki Pythona
- 3 dependencies
- 2 zmienne środowiskowe
- ~120 linii kodu

**Prosty. Działa. Można rozbudować.**
