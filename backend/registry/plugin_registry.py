from typing import Dict
from plugins.base import DataSourcePlugin

class PluginRegistry:
    def __init__(self):
        self.plugins: Dict[str, DataSourcePlugin] = {}

    def register_plugin(self, name: str, plugin: DataSourcePlugin):
        self.plugins[name] = plugin

    def get_plugin(self, name: str):
        return self.plugins.get(name)

    def list_plugins(self):
        return list(self.plugins.keys())  
