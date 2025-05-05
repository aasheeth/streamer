from abc import ABC, abstractmethod
from typing import Dict, List, Any

class DataSourcePlugin(ABC):
    @abstractmethod
    async def get_data_stream(self, chunk_size: int = 10) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_source_info(self) -> Dict[str, Any]:
        pass
