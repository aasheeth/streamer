import os
import json
import asyncio
from typing import Dict, List, Any, AsyncGenerator
from .base import DataSourcePlugin


class FileDataSourcePlugin(DataSourcePlugin):
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.file_type = os.path.splitext(file_path)[1].lower()

    async def get_data_stream(self, chunk_size: int = 10) -> AsyncGenerator[List[Dict[str, Any]], None]:
        if not os.path.exists(self.file_path):
            return 

        if self.file_type == '.json':
            with open(self.file_path, 'r') as file:
                data = json.load(file)

            if isinstance(data, list):
                for i in range(0, len(data), chunk_size):
                    chunk = data[i:i + chunk_size]
                    await asyncio.sleep(0.5)
                    yield chunk

            elif isinstance(data, dict) and any(isinstance(v, list) for v in data.values()):
                for key, value in data.items():
                    if isinstance(value, list):
                        for i in range(0, len(value), chunk_size):
                            chunk = value[i:i + chunk_size]
                            chunk_with_key = [{**item, "_source_key": key} for item in chunk]
                            await asyncio.sleep(0.5)
                            yield chunk_with_key

            else:
                await asyncio.sleep(0.5)
                yield [data]

        elif self.file_type == '.txt':
            with open(self.file_path, 'r') as file:
                lines = file.readlines()

            for i in range(0, len(lines), chunk_size):
                chunk = lines[i:i + chunk_size]
                chunk_dicts = [{"line": line.strip(), "index": i + idx} for idx, line in enumerate(chunk)]
                await asyncio.sleep(0.5)
                yield chunk_dicts

        else:
            return  

    def get_source_info(self) -> Dict[str, Any]:
        return {
            "type": "file",
            "path": self.file_path,
            "file_type": self.file_type,
            "exists": os.path.exists(self.file_path),
            "size": os.path.getsize(self.file_path) if os.path.exists(self.file_path) else 0,
        }
