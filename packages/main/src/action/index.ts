import {type BrowserWindow, ipcMain, shell} from 'electron';
import {addAccount} from '/@/utils';

const listenOpenExternal = () => {
  // restore browser view with persist
  ipcMain.on('open-external', (_, url) => {
    shell.openExternal(url);
  });
};

const listenAddAccount = (window: BrowserWindow) => {
  ipcMain.handle('add-account', (_, opt) => {
    addAccount(window, opt);
  });
};

export default (window: BrowserWindow) => {
  listenOpenExternal();
  listenAddAccount(window);
};
