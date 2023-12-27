import {ipcRenderer} from 'electron';

export {versions} from './versions';

export const getUserInfoWithBackend = (cb: (params: any) => void) => {
  ipcRenderer.on('save-user-info-to-front', (_, arg) => {
    cb(arg);
  });
};

export const openExternal = (url: string) => {
  ipcRenderer.send('open-external', url);
};

export const getAccountList = (cb: (params: any) => void) => {
  ipcRenderer.on('send-accountList', (_, arg) => {
    cb(arg);
  });
};
