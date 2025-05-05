import asyncio
import psycopg2
import psycopg2.extras
from typing import Dict, List, Any
from .base import DataSourcePlugin
from core.config import DB_CONFIG
import os
from typing import AsyncGenerator

class PostgresDataSourcePlugin(DataSourcePlugin):
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.conn_string = f"host={os.getenv('DB_HOST', 'localhost')} " \
                           f"port={os.getenv('DB_PORT', '5432')} " \
                           f"dbname={os.getenv('DB_NAME', 'postgres')} " \
                           f"user={os.getenv('DB_USER', 'postgres')} " \
                           f"password={os.getenv('DB_PASSWORD', '')}"

    async def get_data_stream(self, chunk_size: int = 10) -> AsyncGenerator[List[Dict[str, Any]], None]:
        try:
            conn = psycopg2.connect(self.conn_string)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute(f"SELECT COUNT(*) FROM {self.table_name}")
            total_count = cursor.fetchone()['count']
            for offset in range(0, total_count, chunk_size):
                cursor.execute(f"SELECT * FROM {self.table_name} LIMIT {chunk_size} OFFSET {offset}")
                chunk = cursor.fetchall()
                chunk_list = [dict(row) for row in chunk]
                await asyncio.sleep(0.5)
                
                yield chunk_list
                
            cursor.close()
            conn.close()
            
        except Exception as e:
            print(f"Database error: {e}")
            yield []

    def get_source_info(self) -> Dict[str, Any]:
        try:
            conn = psycopg2.connect(self.conn_string)
            cursor = conn.cursor()
            cursor.execute(f"SELECT COUNT(*) FROM {self.table_name}")
            row_count = cursor.fetchone()[0]
            cursor.execute(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{self.table_name}'
            """)
            columns = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {
                "type": "postgres",
                "table": self.table_name,
                "row_count": row_count,
                "columns": [{"name": col[0], "type": col[1]} for col in columns]
            }
            
        except Exception as e:
            print(f"Error getting source info: {e}")
            return {
                "type": "postgres",
                "table": self.table_name,
                "error": str(e)
            }

