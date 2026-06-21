import socket
import sys
import os

if len(sys.argv) > 1:
    os.environ["MAXX_FRONTEND_DIR"] = sys.argv[1]

import uvicorn
from server import app

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

if __name__ == '__main__':
    port = get_free_port()
    # Print the assigned port so the Electron parent process can read it
    print(f"PORT:{port}")
    sys.stdout.flush()
    
    # Run the FastAPI app
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
