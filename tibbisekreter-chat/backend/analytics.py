import json
from collections import Counter

def read_logs(path="log.json"):
    """log.json dosyasını satır satır okur ve JSON formatında liste olarak döner."""
    logs = []
    try:
        with open(path, "r", encoding="utf-8") as f:
            logs = [json.loads(line) for line in f]
    except FileNotFoundError:
        print("❌ log.json dosyası bulunamadı.")
    except json.JSONDecodeError:
        print("❌ log.json dosyasında hatalı JSON formatı var.")

    return logs

def analyze_logs(logs):
    """Log verilerini analiz ederek rapor oluşturur."""
    total_logs = len(logs)
    print(f"\n📊 Toplam kayıtlı soru: {total_logs}")

    # Boş yanıtları belirle
    empty_responses = [log for log in logs if not log["response"].strip()]
    empty_count = len(empty_responses)
    print(f"⚠️ Boş cevap sayısı: {empty_count}")

    # En sık sorulan soruları analiz et
    questions = [log["question"].lower() for log in logs]
    question_counter = Counter(questions)
    print("\n🔁 En çok tekrar eden sorular:")
    for question, count in question_counter.most_common(5):
        print(f"   • '{question}' → {count} kez")

    # Sorularda en sık geçen kelimeleri bul
    words = [word for question in questions for word in question.split()]
    word_counter = Counter(words)
    print("\n🗣️ En çok geçen kelimeler:")
    for word, count in word_counter.most_common(5):
        print(f"   • '{word}' → {count} kez")

if __name__ == "__main__":
    logs = read_logs()
    if logs:
        analyze_logs(logs)