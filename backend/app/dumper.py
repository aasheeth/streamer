import json
import os

data = [{"id": i, "name": f"Item {i}", "value": i * 10} for i in range(1, 10001)]

os.makedirs("data", exist_ok=True)

with open("data/sample.json", "w") as f:
    json.dump(data, f, indent=2)
