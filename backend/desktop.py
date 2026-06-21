import threading
import uvicorn
import webview
import socket
from server import app
import sys
import os

import time

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('localhost', 0))
    port = s.getsockname()[1]
    s.close()
    return port

def wait_for_port(port, timeout=10.0):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=0.1):
                return
        except OSError:
            time.sleep(0.1)

def run_server(port):
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")

if __name__ == '__main__':
    port = get_free_port()
    
    # Start the backend server in a daemon thread
    t = threading.Thread(target=run_server, args=(port,), daemon=True)
    t.start()
    
    # Wait for the server to become responsive before loading the UI
    wait_for_port(port)
    
    # Initialize pywebview window pointing to the local backend
    webview.create_window(
        'Maxx Player', 
        f'http://127.0.0.1:{port}', 
        width=1280, 
        height=800,
        min_size=(800, 600)
    )
    
    # Start the webview GUI loop
    webview.start()
