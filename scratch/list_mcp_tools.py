import requests
import json

url = "https://mcp.quran.ai/"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
}
payload = {
    "jsonrpc": "2.0",
    "method": "list_tools",
    "params": {},
    "id": 1
}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
