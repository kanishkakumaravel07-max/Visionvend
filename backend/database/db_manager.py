import os
import sqlite3
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class DBManager:
    def __init__(self):
        self.db_type = 'mysql'
        self.host = os.getenv('DB_HOST', 'localhost')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.database = os.getenv('DB_NAME', 'visionvend')
        
        # Test MySQL connection
        try:
            import mysql.connector
            self.conn_test = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password
            )
            cursor = self.conn_test.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database}")
            self.conn_test.commit()
            cursor.close()
            self.conn_test.close()
            logger.info("Successfully connected to MySQL database.")
        except Exception as e:
            logger.warning(f"MySQL connection failed: {e}. Falling back to SQLite for local development.")
            self.db_type = 'sqlite'
            self.sqlite_path = os.path.join(os.path.dirname(__file__), 'fallback_visionvend.db')
            self._init_sqlite()

    def _init_sqlite(self):
        """Initializes the SQLite fallback database schema."""
        conn = sqlite3.connect(self.sqlite_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name TEXT NOT NULL UNIQUE,
                quantity INTEGER NOT NULL DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name TEXT NOT NULL,
                current_stock INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'LOW STOCK',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Prepopulate with dummy retail items for immediate dashboard aesthetics
        cursor.execute("SELECT COUNT(*) FROM inventory")
        if cursor.fetchone()[0] == 0:
            initial_stock = [
                ("CocaCola", 15),
                ("Pepsi", 8),
                ("Water Bottle", 25),
                ("Chips Packet", 5),
                ("Biscuit", 12),
                ("Juice Carton", 4)
            ]
            cursor.executemany("INSERT INTO inventory (product_name, quantity) VALUES (?, ?)", initial_stock)
            
            # Add some alerts for low stock items (threshold = 10)
            cursor.execute("INSERT INTO alerts (product_name, current_stock, status) VALUES ('Pepsi', 8, 'LOW STOCK')")
            cursor.execute("INSERT INTO alerts (product_name, current_stock, status) VALUES ('Chips Packet', 5, 'LOW STOCK')")
            cursor.execute("INSERT INTO alerts (product_name, current_stock, status) VALUES ('Juice Carton', 4, 'OUT OF STOCK')")
            
        conn.commit()
        conn.close()

    def get_connection(self):
        if self.db_type == 'mysql':
            import mysql.connector
            return mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
        else:
            return sqlite3.connect(self.sqlite_path)

    def execute_query(self, query, params=None, fetch=False):
        """Helper to run standard SQL queries."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Replace %s with ? if SQLite
        if self.db_type == 'sqlite':
            query = query.replace('%s', '?')
            # Handle standard MySQL function differences if any
            query = query.replace('ON DUPLICATE KEY UPDATE', 'ON CONFLICT(product_name) DO UPDATE SET')
            # If the query contains ON CONFLICT, adjust the SQLite update statement format
            if 'ON CONFLICT(product_name)' in query:
                # E.g., MySQL: INSERT INTO inventory (product_name, quantity) VALUES (%s, %s) ON DUPLICATE KEY UPDATE quantity = %s
                # E.g., SQLite equivalent: INSERT INTO inventory (product_name, quantity) VALUES (?, ?) ON CONFLICT(product_name) DO UPDATE SET quantity = excluded.quantity, last_updated = CURRENT_TIMESTAMP
                # We can construct the SQLite statement manually
                if 'inventory' in query:
                    # Parse values
                    qty = params[1]
                    cursor.execute(
                        "INSERT INTO inventory (product_name, quantity) VALUES (?, ?) ON CONFLICT(product_name) DO UPDATE SET quantity = ?, last_updated = CURRENT_TIMESTAMP",
                        (params[0], qty, qty)
                    )
                    conn.commit()
                    cursor.close()
                    conn.close()
                    return
        
        try:
            cursor.execute(query, params or ())
            if fetch:
                result = cursor.fetchall()
                # If mysql, convert list of tuples to lists or keep as tuples
                return result
            conn.commit()
        except Exception as e:
            logger.error(f"Database error executing query: {query}. Error: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

    def get_inventory(self):
        """Fetches all items in inventory."""
        query = "SELECT id, product_name, quantity, last_updated FROM inventory ORDER BY product_name"
        rows = self.execute_query(query, fetch=True)
        return [
            {
                "id": row[0],
                "product_name": row[1],
                "quantity": row[2],
                "last_updated": str(row[3])
            }
            for row in rows
        ]

    def update_inventory(self, product_name, quantity):
        """Updates or inserts inventory. Triggers alerts if needed."""
        # Clean product name to match case conventions
        product_name = product_name.strip()
        
        if self.db_type == 'mysql':
            query = """
                INSERT INTO inventory (product_name, quantity)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE quantity = %s, last_updated = CURRENT_TIMESTAMP
            """
            self.execute_query(query, (product_name, quantity, quantity))
        else:
            query = """
                INSERT INTO inventory (product_name, quantity)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE quantity = %s
            """
            self.execute_query(query, (product_name, quantity))

        # Check stock threshold (10 items or less counts as low stock)
        threshold = 10
        if quantity <= 0:
            self.add_alert(product_name, quantity, 'OUT OF STOCK')
        elif quantity <= threshold:
            self.add_alert(product_name, quantity, 'LOW STOCK')
        else:
            # If stock is fine, mark existing alerts as RESOLVED
            self.resolve_alerts(product_name)

    def add_alert(self, product_name, current_stock, status='LOW STOCK'):
        """Adds a warning alert if it does not already exist with similar details."""
        # Check if an active alert already exists for this product with the same status and current stock
        check_query = "SELECT id FROM alerts WHERE product_name = %s AND status = %s ORDER BY created_at DESC LIMIT 1"
        existing = self.execute_query(check_query, (product_name, status), fetch=True)
        
        # Insert new alert if no recent alert exists or status/stock changed
        insert_query = "INSERT INTO alerts (product_name, current_stock, status) VALUES (%s, %s, %s)"
        self.execute_query(insert_query, (product_name, current_stock, status))

    def resolve_alerts(self, product_name):
        """Resolves active warnings when stock is replenished."""
        query = "UPDATE alerts SET status = 'RESOLVED' WHERE product_name = %s AND status IN ('LOW STOCK', 'OUT OF STOCK')"
        self.execute_query(query, (product_name,))

    def get_alerts(self):
        """Fetches active and historical alerts."""
        query = "SELECT id, product_name, current_stock, status, created_at FROM alerts ORDER BY created_at DESC LIMIT 50"
        rows = self.execute_query(query, fetch=True)
        return [
            {
                "id": row[0],
                "product_name": row[1],
                "current_stock": row[2],
                "status": row[3],
                "created_at": str(row[4])
            }
            for row in rows
        ]
