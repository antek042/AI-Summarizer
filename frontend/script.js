const API_URL = '/api';

// DOM elements
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById('submitBtn');
const resultContainer = document.getElementById('resultContainer');
const summaryContent = document.getElementById('summaryContent');
const loader = document.getElementById('loader');
const modelInput = document.getElementById('modelInput');
const copyBtn = document.getElementById('copyBtn');

// Set default model
modelInput.value = 'google/gemini-flash-1.5';

// Auto-resize textarea
const autoResize = () => {
    textInput.style.height = 'auto';
    textInput.style.height = `${textInput.scrollHeight}px`;
};

// Character counter and visual validation
const updateCount = () => {
    const length = textInput.value.length;
    charCount.textContent = `${length} characters`;

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

// Copy summary to clipboard
copyBtn.addEventListener('click', async () => {
    const text = summaryContent.innerText.trim();
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 1500);
    } catch (error) {
        alert('Failed to copy');
    }
});

// Main summarize function
async function summarizeText() {
    const text = textInput.value.trim();
    const model = modelInput.value.trim() || 'google/gemini-flash-1.5';

    // Validation
    if (text.length < 50) {
        alert('Text must be at least 50 characters');
        return;
    }

    if (text.length > 50000) {
        alert('Text cannot exceed 50,000 characters');
        return;
    }

    // Show loader
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
            throw new Error(data.error || 'An error occurred');
        }

        const markdown = data.summary || '';
        summaryContent.innerHTML = window.marked ? marked.parse(markdown) : markdown;
        resultContainer.hidden = false;
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        loader.hidden = true;
        submitBtn.disabled = false;
    }
}

submitBtn.addEventListener('click', (event) => {
    event.preventDefault();
    summarizeText();
});

// Initialize
updateCount();
autoResize();
loader.hidden = true;
