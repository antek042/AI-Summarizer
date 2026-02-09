# AI Summarizer - Project Requirements

## Project Description

A web application for automatic summarization of textual materials according to the Pareto principle (20/80) with export to Markdown format.

## Business Goals

- Quickly extract the most important information from long texts
- Save user time through automatic summaries
- Easy export and further use of summaries
- Ability to use various free AI models via OpenRouter

## Technology Stack

### Backend
- **Python 3.9+**
- **Flask** – lightweight web framework
- **OpenRouter API** – access to free AI models

### Frontend
- **HTML5** – structure
- **CSS3** – styling (possible use of TailwindCSS CDN)
- **Vanilla JavaScript** – client-side logic
- *No React/Vue/Angular – maximum simplicity*

### Tools
- **pip** – Python dependency management
- **venv** – virtual environment
- **git** – version control

## MVP Functionalities (Minimum Viable Product)

### F1: Text Input
**Priority:** MUST HAVE  
**Description:** The user can enter text to be processed

**Acceptance Criteria:**
- Text area with minimum size of 500 characters
- Character counter showing the length of the entered text
- Placeholder with example text
- Validation: minimum 50 characters, maximum 50000 characters

### F2: AI Summarization according to 20/80 Principle
**Priority:** MUST HAVE  
**Description:** The system generates a summary containing 20% of information representing 80% of value

**Acceptance Criteria:**
- Integration with OpenRouter API
- AI prompt containing Pareto 20/80 principle instruction
- API error handling (timeout, limit, invalid key)
- Loader/spinner during processing
- Display the summary in a readable format

**Prompt for AI:**
```
Analyze the following text and extract the most important information according to the Pareto 20/80 principle.
Your summary should contain 20% of the content that represents 80% of the value and key conclusions.

Format the result in Markdown with:
- Headings (##) for main sections
- Bullet lists for key points
- Bold (**) for the most important terms
- Short, concise sentences

Text to analyze:
{user_text}
```