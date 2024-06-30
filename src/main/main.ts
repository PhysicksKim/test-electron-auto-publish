import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

let updaterWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

class AppUpdater {
  constructor() {
    console.log('AppUpdater constructor');
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      console.log('Checking for update...');
      if (mainWindow) {
        mainWindow.webContents.send('message', '업데이트 확인 중...');
        mainWindow.webContents.send('isUpdating', true);
      }
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available.');
      if (mainWindow) {
        mainWindow.webContents.send('message', '업데이트 가능. 다운로드 중...');
      }
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available.');
      if (mainWindow) {
        mainWindow.webContents.send(
          'message',
          '업데이트가 없습니다. 앱을 시작합니다...',
        );
        mainWindow.webContents.send('isUpdating', false);
      }
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater. ' + err);
      if (mainWindow) {
        mainWindow.webContents.send('message', '오류: ' + err);
        mainWindow.webContents.send('isUpdating', false);
      }
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let logMessage = '다운로드 속도: ' + progressObj.bytesPerSecond;
      logMessage = logMessage + ' - 다운로드 ' + progressObj.percent + '% 완료';
      logMessage =
        logMessage +
        ' (' +
        progressObj.transferred +
        '/' +
        progressObj.total +
        ')';
      log.info(logMessage);
      if (mainWindow) {
        mainWindow.webContents.send('message', `로그:${logMessage}`);
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded');
      if (mainWindow) {
        mainWindow.webContents.send(
          'message',
          '업데이트 다운로드 완료. 앱을 재시작합니다...',
        );
      }
      autoUpdater.quitAndInstall(true, true); // isSilent = true, isForceRunAfter = true
    });

    autoUpdater.checkForUpdatesAndNotify();
  }
}

ipcMain.on('react-ready', (event, arg) => {
  console.log(arg); // "react is ready" message
  new AppUpdater();
  mainWindow?.webContents.send('message', '앱 업데이터 동작');
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

const createTestWindow = async () => {
  const testWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  testWindow.loadURL(resolveHtmlPath('testwindow.html'));
};

ipcMain.on('open-test-window', () => {
  createTestWindow();
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createMainWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createMainWindow();
  })
  .catch(console.log);
