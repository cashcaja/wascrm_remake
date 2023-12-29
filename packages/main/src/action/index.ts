import {type BrowserWindow, ipcMain, shell} from 'electron';
import {addAccount, closeInstance, distributionMsgWithSend, startup} from '/@/utils';

const listenOpenExternal = () => {
  // restore browser view with persist
  ipcMain.on('open-external', (_, url) => {
    shell.openExternal(url);
  });
};

const listenAddAccount = (window: BrowserWindow) => {
  ipcMain.on('add-account', (_, opt) => {
    addAccount(window, opt);
  });
};

const listenRestoreAccount = (window: BrowserWindow) => {
  // restore browser view with persist
  ipcMain.on('restore-account', () => {
    startup(window);
  });
};

const listenCloseInstance = () => {
  ipcMain.on('close-instance', (_, persistId) => {
    console.log('close-instance', persistId);
    closeInstance(persistId);
  });
};

const listenSendMsgToClient = () => {
  ipcMain.handle('send-msg-to-client', async (_, params) => {
    try {
      console.log('send-msg-to-client', params);
      await distributionMsgWithSend(params.persistId, params.msg, params.to);
      return {msg: 'send success', status: 'ok'};
    } catch (e: any) {
      return {msg: e.toString(), status: 'error'};
    }
  });
};

export default (window: BrowserWindow) => {
  listenOpenExternal();
  listenAddAccount(window);
  listenRestoreAccount(window);
  listenCloseInstance();
  listenSendMsgToClient();
};
