const API_URL = '/api';

// Elementy DOM
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById('submitBtn');
const resultContainer = document.getElementById('resultContainer');
const summaryContent = document.getElementById('summaryContent');
const loader = document.getElementById('loader');
const modelInput = document.getElementById('modelInput');
const copyBtn = document.getElementById('copyBtn');

// Ustaw domyślny model
modelInput.value = 'google/gemini-flash-1.5';

// Automatyczne dopasowanie wysokości textarea
const autoResize = () => {
    textInput.style.height = 'auto';
    textInput.style.height = `${textInput.scrollHeight}px`;
};

// Licznik znaków i walidacja wizualna
const updateCount = () => {
    const length = textInput.value.length;
    charCount.textContent = `${length} znaków`;

    if (length < 50 || length > 50000) {
        charCount.style.color = '#ef4444';
    } else {
        charCount.style.color = '#22c55e';
    }
};

textInput.addEventListener('input', () => {
    autoResize();
    updateCount();
});

// Kopiowanie podsumowania
copyBtn.addEventListener('click', async () => {
    const text = summaryContent.innerText.trim();
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Skopiowano';
        setTimeout(() => {
            copyBtn.textContent = 'Kopiuj';
        }, 1500);
    } catch (error) {
        alert('Nie udało się skopiować');
    }
});

// Główna funkcja podsumowania
async function summarizeText() {
    const text = textInput.value.trim();
    const model = modelInput.value.trim() || 'google/gemini-flash-1.5';

    // Walidacja
    if (text.length < 50) {
        alert('Tekst musi mieć minimum 50 znaków');
        return;
    }

    if (text.length > 50000) {
        alert('Tekst może mieć maksymalnie 50000 znaków');
        return;
    }

    // Loader
    loader.hidden = false;
    submitBtn.disabled = true;
    resultContainer.hidden = true;

    try {
        const response = await fetch(`${API_URL}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, model })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Wystąpił błąd');
        }

        const markdown = data.summary || '';
        summaryContent.innerHTML = window.marked ? marked.parse(markdown) : markdown;
        resultContainer.hidden = false;
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        alert(`Błąd: ${error.message}`);
    } finally {
        loader.hidden = true;
        submitBtn.disabled = false;
    }
}

submitBtn.addEventListener('click', (event) => {
    event.preventDefault();
    summarizeText();
});

// Inicjalizacja
updateCount();
autoResize();
loader.hidden = true;
