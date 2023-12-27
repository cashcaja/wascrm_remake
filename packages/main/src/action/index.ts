import {type BrowserWindow, ipcMain, shell} from 'electron';

const listenOpenExternal = () => {
  // restore browser view with persist
  ipcMain.on('open-external', (_, url) => {
    shell.openExternal(url);
  });
};

export default (window: BrowserWindow) => {
  console.log(window);
  listenOpenExternal();
};
