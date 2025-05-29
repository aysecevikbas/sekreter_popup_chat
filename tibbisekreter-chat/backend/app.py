from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timedelta
import sqlite3
import json

# .env dosyasını yükle
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
CORS(app)

# OpenAI API anahtarı
openai.api_key = os.getenv("OPENAI_API_KEY")
print("✅ API Key yüklendi mi? :", openai.api_key is not None)

# ✅ Logları hem veritabanına hem log.json'a yaz ve 7 günden eski kayıtları sil
def log_interaction(user_input, response):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "question": user_input,
        "response": response
    }

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    # 📁 Veritabanına yaz ve eski kayıtları sil
    try:
        db_path = os.path.join(os.path.dirname(__file__), 'logs.db')
        print("📁 DB yolu:", db_path)
        conn = sqlite3.connect(db_path)
        c = conn.cursor()

        # 7 günden eski verileri sil
        c.execute("DELETE FROM logs WHERE timestamp < ?", (seven_days_ago.isoformat(),))

        # Yeni logu ekle
        c.execute("INSERT INTO logs (question, answer) VALUES (?, ?)", (user_input, response))
        conn.commit()
        conn.close()
        print("✅ Veritabanına log yazıldı ve eski kayıtlar silindi.")
    except Exception as e:
        print("❌ Veritabanına yazma hatası:", e)

    # 📝 log.json'a yaz ve eski kayıtları temizle
    try:
        logs = []
        if os.path.exists("log.json"):
            with open("log.json", "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        entry_time = datetime.fromisoformat(entry.get("timestamp", ""))
                        if entry_time > seven_days_ago:
                            logs.append(entry)
                    except Exception:
                        continue  # bozuk satır varsa geç

        logs.append(log_entry)

        with open("log.json", "w", encoding="utf-8") as f:
            for entry in logs:
                f.write(json.dumps(entry) + "\n")
        print("📝 log.json'a da yazıldı ve eski kayıtlar temizlendi.")
    except Exception as e:
        print("❌ log.json yazım hatası:", e)

# 🔮 Ana sohbet endpoint
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

# 📤 Veritabanından logları dönen endpoint
@app.route("/logs", methods=["GET"])
def get_logs():
    try:
        db_path = os.path.join(os.path.dirname(__file__), 'logs.db')
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("SELECT question, answer, timestamp FROM logs ORDER BY id DESC")
        rows = c.fetchall()
        conn.close()

        logs = [{"question": row[0], "answer": row[1], "timestamp": row[2]} for row in rows]
        return jsonify({"logs": logs})
    except Exception as e:
        print("❌ Logları okurken hata:", e)
        return jsonify({"logs": []})

# 🚀 Uygulamayı başlat
if __name__ == "__main__":
    app.run(port=5000)
