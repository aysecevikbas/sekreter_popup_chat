from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
from pathlib import Path

# .env dosyasının tam yolunu al
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
CORS(app)

# .env dosyasındaki anahtarı al
openai.api_key = os.getenv("OPENAI_API_KEY")
print("API Key:", openai.api_key)  # ✅ Konsolda görmek için

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt")

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        reply = response["choices"][0]["message"]["content"]
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"reply": f"Hata oluştu: {str(e)}"})

if __name__ == "__main__":
    app.run(port=5000)
