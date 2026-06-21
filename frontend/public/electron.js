const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

const isDev = !app.isPackaged;

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    title: 'Maxx Player',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}/`);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  console.log("Starting backend...");
  let cmd;
  let args;
  
  if (isDev) {
    // In development, run the python script directly
    cmd = 'python';
    const runnerPath = path.join(__dirname, '..', '..', 'backend', 'runner.py');
    const frontendDir = path.join(__dirname, '..', 'build');
    args = [runnerPath, frontendDir];
  } else {
    // In production, run the packaged executable
    cmd = path.join(process.resourcesPath, '..', 'bin', 'server.exe');
    const frontendDir = path.join(process.resourcesPath, '..', 'frontend');
    args = [frontendDir];
  }
  
  console.log(`Running: ${cmd} ${args.join(' ')}`);
  
  serverProcess = spawn(cmd, args, {
    detached: false
  });

  let portFound = false;

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Backend: ${output}`);
    
    // Look for PORT:xxxx
    if (!portFound) {
      const match = output.match(/PORT:(\d+)/);
      if (match) {
        portFound = true;
        const port = match[1];
        console.log(`Backend started on port ${port}`);
        createWindow(port);
      }
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data.toString()}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

app.on('ready', startBackend);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Ensure the backend process is killed when the app quits
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    // We would need to know the port again to re-create the window on macOS,
    // but this app is targeted for Windows primarily.
  }
});
