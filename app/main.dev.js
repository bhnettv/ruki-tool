/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { getPluginEntry } from 'mpv.js';
import MenuBuilder from './menu';
import { getMediaPath, setMediaPath } from './config';

let mainWindow = null;

// Absolute path to the plugin directory.
// const pluginDir = path.join(path.dirname(require.resolve("mpv.js")), "build", "Release");
const pluginDir = process.env.NODE_ENV === 'production' ? path.join(__dirname, '../app.asar.unpacked', 'mpv') : path.join(__dirname, 'mpv');

// See pitfalls section for details.
// if (process.platform !== "linux") {process.chdir(pluginDir);}
// To support a broader number of systems.
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("register-pepper-plugins", getPluginEntry(pluginDir));

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1850,
    height: 920,
    webPreferences: { plugins: true }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (!(process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true')) {
    mainWindow.webContents.openDevTools();
  }

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // 监听打开目录
  ipcMain.on('open-file-dialog', (event) => {
    // 从应用目录获取视频根目录
    dialog.showOpenDialog(mainWindow, {
      defaultPath: getMediaPath(),
      properties: ['openDirectory']
    }, (files) => {
      if (files) {
        const regexp = new RegExp('^(.+)/(ddpai|s360)/(.+)$');
        const results = regexp.exec(files);
        // 路径的第一个匹配作为视频根目录，并且写入配置文件
        if (results && results[1]) {
          setMediaPath(results[1]);
        }
        // 路径的后两个匹配作为文件夹根和文件夹
        if (results && results[2] && results[3]) {
          event.sender.send('selected-directory', { root: results[2], sub: results[3] });
        }
      }
    });
  });

  // 监听获取用户目录
  ipcMain.on('get-userPath', (event) => {
    const userPath = app.getPath('temp');
    event.sender.send('return-userPath', userPath);
  });
});
