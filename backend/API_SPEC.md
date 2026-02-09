# API Specification - AI Summarizer

## Filozofia: Maksymalny Minimalizm

- 2 endpointy (może nawet 1)
- Proste JSON in/out
- Zero boilerplate
- Wszystko co potrzebne, nic więcej

---

## Endpoint 1: Główna Strona

```
GET /
```

**Zwraca:** `index.html` (frontend)

**To wszystko.** Flask serwuje statyczny plik.

---

## Endpoint 2: Podsumowanie

```
POST /api/summarize
```

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "text": "Tekst do podsumowania...",
  "model": "google/gemini-flash-1.5"
}
```

**Pola:**
- `text` (string, **required**) - tekst do podsumowania
- `model` (string, **optional**) - jeśli brak, używa DEFAULT_MODEL z .env (domyślnie: google/gemini-flash-1.5)

**Walidacja:**
- `text` musi istnieć
- `text.length` >= 50
- `text.length` <= 50000

---

### Response: Success

**Status:** `200 OK`

**Body:**
```json
{
  "summary": "## Główne punkty\n\n- Punkt 1\n- Punkt 2..."
}
```

**Pola:**
- `summary` (string) - podsumowanie w formacie Markdown

---

### Response: Validation Error

**Status:** `400 Bad Request`

**Body:**
```json
{
  "error": "Tekst musi mieć 50-50000 znaków"
}
```

**Możliwe błędy:**
- "Brak tekstu"
- "Tekst za krótki (minimum 50 znaków)"
- "Tekst za długi (maksimum 50000 znaków)"

---

### Response: Server Error

**Status:** `500 Internal Server Error`

**Body:**
```json
{
  "error": "Przekroczono czas oczekiwania"
}
```

**Możliwe błędy:**
- "Przekroczono czas oczekiwania"
- "Błąd połączenia z API"
- "Wystąpił błąd, spróbuj ponownie"

---

## To wszystko. Tylko 2 endpointy.

## Przykłady użycia

### curl - Success

```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
    "model": "google/gemini-flash-1.5"
  }'
```

**Odpowiedź:**
```json
{
  "summary": "## Podsumowanie\n\nTekst dotyczy Lorem Ipsum..."
}
```

---

### curl - Validation Error

```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Za krótkie"}'
```

**Odpowiedź:**
```json
{
  "error": "Tekst za krótki (minimum 50 znaków)"
}
```

---

### JavaScript fetch - Frontend

```javascript
const response = await fetch('/api/summarize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: textInput.value,
    model: modelSelect.value
  })
});

if (response.ok) {
  const { summary } = await response.json();
  // Wyświetl summary
} else {
  const { error } = await response.json();
  alert(error);
}
```

---

## Struktura Response - Zasady

### Success (200)
- Zawsze obiekt z danymi
- Klucz opisuje co zwracamy: `summary`, `result`, `data`
- **Nic więcej** - żadnego `success: true`, `timestamp`, `metadata`

### Error (400/500)
- Zawsze obiekt z błędem
- Klucz: `error`
- Wartość: string zrozumiały dla użytkownika
- **Nic więcej** - żadnych kodów błędów, stack traces

### Dlaczego tak prosto?

**Nie chcemy:**
```json
{
  "success": true,
  "data": {
    "summary": "...",
    "metadata": {
      "model": "...",
      "tokens": 123
    }
  },
  "timestamp": "2025-02-09T..."
}
```

**Chcemy:**
```json
{
  "summary": "..."
}
```

**Bo:**
- HTTP status już mówi czy success (200) czy error (400/500)
- Frontend sprawdza `response.ok` - nie potrzebuje `success: bool`
- Metadata można dodać później gdy będzie potrzebne
- Prostsze = łatwiej debugować

---

## Podsumowanie

**Total endpoints:** 2
- `GET /` - serwuje frontend
- `POST /api/summarize` - główna logika

**Request fields:** 2
- `text` (required)
- `model` (optional)

**Response variants:** 3
- 200 + `{summary}`
- 400 + `{error}`
- 500 + `{error}`

**Modele AI (hardcoded w frontend):**
1. `google/gemini-flash-1.5` - szybki, domyślny
2. `meta-llama/llama-3.1-8b-instruct:free` - balans
3. `nousresearch/hermes-3-llama-3.1-405b:free` - najlepsza jakość

Tyle. Gotowe do implementacji.
