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

export const getWaClient = (cb: (params: any) => void) => {
  ipcRenderer.on('get-wa-client', (_, arg) => {
    cb(arg);
  });
};
