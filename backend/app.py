from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
from summarizer import SummarizerService

load_dotenv()
app = Flask(__name__, static_folder="../frontend", static_url_path="")
summarizer = SummarizerService()

@app.route("/")
def index():
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/summarize', methods=["POST"])
def summarize():
        data = request.get_json()

        if not data or 'text' not in data:
                return jsonify({'error': 'No text'}), 400
        
        text = data["text"]
        if len(text) < 50:
                return jsonify({'error': 'Tekst za krótki (minimum 50 znaków)'}), 400
        if len(text) > 50000:
                return jsonify({'error': 'Tekst za długi (maksimum 50000 znaków)'}), 413
        
        model = data.get("model", "tngtech/deepseek-r1t2-chimera:free")

        try:
                summary = summarizer.summarize(text, model)
                return jsonify({"summary": summary}), 200
        except Exception as e:
                return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
        app.run(debug=True)