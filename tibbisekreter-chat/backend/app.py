from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timedelta
import json

# .env dosyasını yükle
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
CORS(app)

# OpenAI API anahtarını yükle
openai.api_key = os.getenv("OPENAI_API_KEY")
print("✅ API Key yüklendi mi? :", openai.api_key is not None)

# 🔐 Haftalık log temizlemeli log kaydı fonksiyonu
def log_interaction(user_input, response):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "question": user_input,
        "response": response
    }

    logs = []
    if os.path.exists("log.json"):
        with open("log.json", "r", encoding="utf-8") as f:
            for line in f:
                try:
                    logs.append(json.loads(line))
                except:
                    continue

    # Eğer eski loglar varsa ve en eskisi 7 günden önceyse logları temizle
    if logs:
        try:
            oldest_time = datetime.fromisoformat(logs[0]["timestamp"])
            if datetime.utcnow() - oldest_time > timedelta(days=7):
                print("🧹 7 günden eski loglar silindi.")
                logs = []
        except Exception as e:
            print("⚠️ Tarih formatı okunamadı, loglar sıfırlanmadı:", e)

    logs.append(log_entry)

    # Dosyaya yeniden yaz
    try:
        with open("log.json", "w", encoding="utf-8") as f:
            for entry in logs:
                f.write(json.dumps(entry) + "\n")
        print("📌 Log eklendi:", log_entry)
    except Exception as e:
        print("❌ Log dosyasına yazarken hata:", e)

# Ana sohbet endpoint'i
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt", "")

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        reply = response["choices"][0]["message"]["content"]
        log_interaction(prompt, reply)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"Hata oluştu: {str(e)}"})

# Logları döndüren endpoint
@app.route("/logs", methods=["GET"])
def get_logs():
    logs = []
    try:
        with open("log.json", "r", encoding="utf-8") as f:
            for line in f:
                try:
                    logs.append(json.loads(line))
                except Exception as e:
                    print("❌ Bozuk log satırı atlandı:", e)
    except FileNotFoundError:
        return jsonify({"logs": []})
    except Exception as e:
        print("❌ Loglar okunurken hata:", e)
        return jsonify({"logs": []})

    return jsonify({"logs": logs})

# Sunucuyu başlat
if __name__ == "__main__":
    app.run(port=5000)
