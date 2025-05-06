from abc import ABC, abstractmethod
from typing import Dict, List, Any, AsyncGenerator

class DataSourcePlugin(ABC):
    @abstractmethod
    async def get_data_stream(self, chunk_size: int = 10) -> AsyncGenerator[List[Dict[str, Any]], None]:
        """
        Returns an async generator that yields chunks of data
        
        Args:
            chunk_size: Number of records to include in each chunk
            
        Yields:
            List of dictionaries representing records in the current chunk
        """
        pass

    @abstractmethod
    def get_source_info(self) -> Dict[str, Any]:
        """
        Returns metadata about this data source
        
        Returns:
            Dictionary with information about the data source
        """
        pass