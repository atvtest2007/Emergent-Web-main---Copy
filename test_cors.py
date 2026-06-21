import urllib.request
import urllib.error

backend_url = "http://127.0.0.1:8000/api/xtream/login"
origin = "http://192.168.68.55:3000"

req = urllib.request.Request(backend_url, method="OPTIONS")
req.add_header("Origin", origin)
req.add_header("Access-Control-Request-Method", "POST")
req.add_header("Access-Control-Request-Headers", "content-type")

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
