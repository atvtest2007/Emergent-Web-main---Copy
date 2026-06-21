import urllib.request
import re
import socket

# Get LAN IP
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))
lan_ip = s.getsockname()[0]
s.close()

print(f"LAN IP: {lan_ip}")

# Fetch frontend homepage
print("Fetching frontend...")
req = urllib.request.Request(f"http://{lan_ip}:3000/")
with urllib.request.urlopen(req) as res:
    html = res.read().decode('utf-8')

# Find JS bundles
scripts = re.findall(r'<script defer="defer" src="(/static/js/main\.[a-z0-9]+\.js)"></script>', html)
if not scripts:
    scripts = re.findall(r'src="(/static/js/bundle\.js)"', html)

if scripts:
    print(f"Found scripts: {scripts}")
    for script in scripts:
        js_url = f"http://{lan_ip}:3000{script}"
        print(f"Fetching {js_url}...")
        req = urllib.request.Request(js_url)
        with urllib.request.urlopen(req) as res:
            js = res.read().decode('utf-8')
            
            # Look for 127.0.0.1
            if '127.0.0.1:8000' in js:
                print("FOUND 127.0.0.1 in JS bundle!")
            
            # Find the BACKEND_URL logic
            match = re.search(r'REACT_APP_BACKEND_URL[^\}]*', js)
            if match:
                print(f"Webpack replaced ENV with: {match.group(0)[:100]}")
else:
    print("No scripts found in HTML. Are we running dev mode? Let's check window.location")
    req = urllib.request.Request(f"http://{lan_ip}:3000/static/js/bundle.js")
    try:
        with urllib.request.urlopen(req) as res:
            js = res.read().decode('utf-8')
            if '127.0.0.1:8000' in js:
                print("FOUND 127.0.0.1 in bundle.js!")
            match = re.search(r'defaultBackendUrl\s*=\s*(.*?);', js)
            if match:
                print(f"Webpack assigned defaultBackendUrl = {match.group(1)}")
    except:
        pass
