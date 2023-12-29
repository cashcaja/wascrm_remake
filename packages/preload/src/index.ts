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

export const getQrCode = (cb: (params: any) => void) => {
  ipcRenderer.on('send-qr-code', (_, arg) => {
    cb(arg);
  });
};

export const addAccount = (opt: Partial<WaClient>) => {
  ipcRenderer.send('add-account', opt);
};

export const startup = () => {
  ipcRenderer.send('restore-account');
};

export const loginSuccess = (cb: () => void) => {
  ipcRenderer.on('login-success', () => {
    cb();
  });
};

export const setLoading = (cb: (status: boolean) => void) => {
  ipcRenderer.on('set-loading', (_, status: boolean) => {
    cb(status);
  });
};

export const closeInstance = (persistId: string) => {
  ipcRenderer.send('close-instance', persistId);
};

export const listenGetChats = (cb: (params: any) => void) => {
  ipcRenderer.on('send-talk-history', (_, chats) => {
    cb(chats);
  });
};

export const sendMsgToClient = (params: {persistId: string; msg: string; to: string}) => {
  return ipcRenderer.invoke('send-msg-to-client', params);
};

export const listenReceiveMsg = (cb: (params: any) => void) => {
  ipcRenderer.on('received-msg-from-client', (_, data: any) => {
    cb(data);
  });
};
