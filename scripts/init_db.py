from pathlib import Path
from parse_quran import init_db

DB_PATH = "assets/db/quran.db"

def main():
    Path("assets/db").mkdir(parents=True, exist_ok=True)

    conn = init_db(DB_PATH, append=False)
    conn.close()

    print("Database initialized successfully!")

if __name__ == "__main__":
    main()