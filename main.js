const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
//   mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
//   });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

// Auto-updater
const sendStatusToWindow = (text) => {
    if (mainWindow) {
      mainWindow.webContents.send('message', text);
    }
  };
  
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  });

  autoUpdater.on('update-available', info => {
    sendStatusToWindow('Update available.');
  });
  autoUpdater.on('update-not-available', info => {
    sendStatusToWindow('Update not available.');
  });

  autoUpdater.on('error', err => {
    sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
  });

  autoUpdater.on('download-progress', progressObj => {
    sendStatusToWindow(
      `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
    );
  });

  autoUpdater.on('update-downloaded', info => {
    sendStatusToWindow('Update downloaded; will install now');
    autoUpdater.quitAndInstall();
  });