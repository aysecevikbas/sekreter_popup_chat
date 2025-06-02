from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timedelta
import sqlite3
import json
import re

# .env dosyasını yükle
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

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

def categorize_question(question):
    """
    Soruyu içeriğine göre kategorilere ayıran fonksiyon
    """
    question_lower = question.lower()
    
    # Acil durum kategorisi
    acil_keywords = ['acil', 'bayıldı', 'nefes', 'göğüs ağrısı', 'kalp', 'kan', 'ateş', 'kusma', 'baş dönmesi', 'nabız']
    if any(keyword in question_lower for keyword in acil_keywords):
        return 'Acil Durum'
    
    # Randevu kategorisi
    randevu_keywords = ['randevu', 'appointment', 'doktor', 'muayene', 'görüşme', 'zaman']
    if any(keyword in question_lower for keyword in randevu_keywords):
        return 'Randevu'
    
    # Yönlendirme kategorisi
    yonlendirme_keywords = ['nerede', 'nasıl', 'hangi', 'bölüm', 'kat', 'yol', 'adres']
    if any(keyword in question_lower for keyword in yonlendirme_keywords):
        return 'Yönlendirme'
    
    # Hasta bakımı kategorisi
    bakim_keywords = ['hasta', 'bakım', 'tedavi', 'ilaç', 'beslenme', 'hijyen']
    if any(keyword in question_lower for keyword in bakim_keywords):
        return 'Hasta Bakımı'
    
    # Bilgi talep kategorisi
    bilgi_keywords = ['bilgi', 'öğren', 'anlat', 'açıkla', 'nedir', 'nasıl']
    if any(keyword in question_lower for keyword in bilgi_keywords):
        return 'Bilgi Talebi'
    
    # Teşekkür kategorisi
    tesekkur_keywords = ['teşekkür', 'sağol', 'mersi', 'thanks']
    if any(keyword in question_lower for keyword in tesekkur_keywords):
        return 'Teşekkür'
    
    return 'Genel'

@app.route('/api/stats/weekly', methods=['GET'])
def get_weekly_stats():
    """
    Son 7 güne ait istatistikleri döndüren API endpoint
    """
    try:
        # Son 7 günün tarih aralığını hesapla
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # Veritabanından son 7 günün verilerini çek
        conn = sqlite3.connect('logs.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT question, answer, timestamp 
            FROM logs 
            WHERE timestamp >= ? 
            ORDER BY timestamp DESC
        ''', (start_date.strftime('%Y-%m-%d %H:%M:%S'),))
        
        weekly_logs = cursor.fetchall()
        conn.close()
        
        # Kategorilere göre grupla
        category_counts = {}
        daily_counts = {}
        
        for question, answer, timestamp in weekly_logs:
            # Kategori belirle
            category = categorize_question(question)
            category_counts[category] = category_counts.get(category, 0) + 1
            
            # Günlük sayım için tarihi al
            date_only = timestamp.split(' ')[0]
            daily_counts[date_only] = daily_counts.get(date_only, 0) + 1
        
        # Son 7 günün tarihlerini oluştur
        date_range = []
        for i in range(7):
            date = (end_date - timedelta(days=i)).strftime('%Y-%m-%d')
            date_range.append({
                'date': date,
                'count': daily_counts.get(date, 0)
            })
        
        # Kategori verilerini formatla
        categories = [{'name': k, 'value': v} for k, v in category_counts.items()]
        
        return jsonify({
            'success': True,
            'period': 'weekly',
            'total_questions': len(weekly_logs),
            'categories': categories,
            'daily_trend': list(reversed(date_range)),
            'date_range': {
                'start': start_date.strftime('%Y-%m-%d'),
                'end': end_date.strftime('%Y-%m-%d')
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats/all', methods=['GET'])
def get_all_time_stats():
    """
    Tüm zamanların istatistiklerini döndüren API endpoint
    """
    try:
        # Veritabanından tüm verileri çek
        conn = sqlite3.connect('logs.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT question, answer, timestamp FROM logs ORDER BY timestamp DESC')
        all_logs = cursor.fetchall()
        conn.close()
        
        # Kategorilere göre grupla
        category_counts = {}
        monthly_counts = {}
        
        for question, answer, timestamp in all_logs:
            # Kategori belirle
            category = categorize_question(question)
            category_counts[category] = category_counts.get(category, 0) + 1
            
            # Aylık sayım için yıl-ay al
            try:
                month_key = timestamp[:7]  # YYYY-MM formatı
                monthly_counts[month_key] = monthly_counts.get(month_key, 0) + 1
            except:
                pass
        
        # Kategori verilerini formatla
        categories = [{'name': k, 'value': v} for k, v in category_counts.items()]
        
        # Aylık trend verilerini formatla
        monthly_trend = [{'month': k, 'count': v} for k, v in sorted(monthly_counts.items())]
        
        return jsonify({
            'success': True,
            'period': 'all_time',
            'total_questions': len(all_logs),
            'categories': categories,
            'monthly_trend': monthly_trend,
            'first_record': all_logs[-1][2] if all_logs else None,
            'last_record': all_logs[0][2] if all_logs else None
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 🚀 Uygulamayı başlat
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)
