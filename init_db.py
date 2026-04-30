import psycopg2
import sys

def main():
    conn_str = "postgresql://pGYRXxF:ZGGAzvC@npvwzgnwprxt.db.dbaas.dev:30731/PwKFWx"
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cursor = conn.cursor()
        print("Connected.")

        with open('/home/qb/pro/vedha/db/init.sql', 'r') as f:
            sql = f.read()

        print("Executing init.sql...")
        cursor.execute(sql)
        print("Database initialized successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
