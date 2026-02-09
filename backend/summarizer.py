from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

class SummarizerService:
        def __init__(self):
                api_key = os.getenv('OPENROUTER_API_KEY')
                if api_key is None:
                        print("No API key readed")
                        exit(500)
                
                self.client = OpenAI(
                        base_url="https://openrouter.ai/api/v1",
                        api_key=api_key,
                )

        def summarize(self, text, model):
                prompt = f"""Przeanalizuj poniższy tekst i wyodrębnij najważniejsze informacje według zasady Pareto 20/80.

                        Twoje podsumowanie powinno zawierać 20% treści, która reprezentuje 80% wartości i kluczowych wniosków.

                        Formatuj wynik w Markdown:
                        - Nagłówki (##) dla głównych sekcji
                        - Listy punktowane dla kluczowych punktów
                        - Pogrubienie (**) dla najważniejszych terminów
                        - Krótkie, treściwe zdania

                        Tekst do analizy:

                        {text}"""
                completion = self.client.chat.completions.create(
                        model=model,
                        messages=[
                                {
                                "role": "user",
                                "content": prompt,
                                }
                        ]
                )
                return completion.choices[0].message.content
