import sqlite3

def create_logs_table():
    conn = sqlite3.connect('logs.db')  # logs.db bu klasörde oluşacak
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Bu dosya çalıştırıldığında tabloyu oluşturur
if __name__ == '__main__':
    create_logs_table()
