import {app, BrowserWindow, Menu, nativeImage, Tray} from 'electron';
import {join, resolve} from 'node:path';
import icon from '/@/assets/logo.png';
import trayIcon from '/@/assets/tray.png';
import listenAction from '/@/action';
import {loadTokens} from '/@/utils/auth';

async function createWindow() {
  const browserWindow = new BrowserWindow({
    icon: nativeImage.createFromDataURL(icon),
    width: 1680,
    height: 800,
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  });

  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  // register protocol
  app.setAsDefaultProtocolClient('dcs');
  app.on('open-url', (_, url) => {
    loadTokens(browserWindow, url);
  });

  // for windows system
  app.on('second-instance', (_, commandLine) => {
    if (browserWindow) {
      if (browserWindow.isMinimized()) browserWindow.restore();
      browserWindow.focus();
    }
    loadTokens(browserWindow, commandLine.pop() as string);
  });

  // listen action event
  listenAction(browserWindow);

  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();
    if (import.meta.env.DEV || process.argv.includes('DEBUG')) {
      browserWindow?.webContents.openDevTools();
    }
  });

  // prevent close window
  browserWindow.on('close', e => {
    browserWindow.hide();
    e.preventDefault();
  });

  // close application menu
  Menu.setApplicationMenu(null);

  // vire tray content and icon
  const tray = new Tray(nativeImage.createFromDataURL(trayIcon).resize({width: 16, height: 16}));
  tray.setToolTip('dcs ai client');
  tray.on('double-click', () => {
    browserWindow?.show();
  });
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'show',
      type: 'normal',
      click: () => browserWindow?.show(),
    },
    {
      label: 'exit',
      type: 'normal',
      click: () => {
        app.exit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  /**
   * Load the main page of the main window.
   */
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
    /**
     * Load from the Vite dev server for development.
     */
    await browserWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL);
  } else {
    /**
     * Load from the local file system for production and test.
     *
     * Use BrowserWindow.loadFile() instead of BrowserWindow.loadURL() for WhatWG URL API limitations
     * when path contains special characters like `#`.
     * Let electron handle the path quirks.
     * @see https://github.com/nodejs/node/issues/12682
     * @see https://github.com/electron/electron/issues/6869
     */
    await browserWindow.loadFile(resolve(__dirname, '../../renderer/dist/index.html'));
  }

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
