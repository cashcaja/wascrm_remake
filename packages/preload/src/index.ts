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

export const newContactMsgToClient = (params: {
  persistId: string;
  msg: string;
  contact: string;
}) => {
  return ipcRenderer.invoke('new-contact', params);
};

export const listenReceiveMsg = (cb: (params: any) => void) => {
  ipcRenderer.on('received-msg-from-client', (_, data: any) => {
    cb(data);
  });
};

export const switchAccountWithClient = (persistId: string) => {
  ipcRenderer.send('switch-account', persistId);
};

export const cleanCacheWithClient = () => {
  ipcRenderer.send('clean-cache');
};

export const sendNotification = (params: {title: string; body: string}) => {
  ipcRenderer.send('send-notification', params);
};

// utils remove all listener

export const cleanListener = () => {
  ipcRenderer.removeAllListeners('save-user-info-to-front');
  ipcRenderer.removeAllListeners('open-external');
  ipcRenderer.removeAllListeners('send-accountList');
  ipcRenderer.removeAllListeners('send-qr-code');
  ipcRenderer.removeAllListeners('add-account');
  ipcRenderer.removeAllListeners('restore-account');
  ipcRenderer.removeAllListeners('login-success');
  ipcRenderer.removeAllListeners('set-loading');
  ipcRenderer.removeAllListeners('close-instance');
  ipcRenderer.removeAllListeners('send-talk-history');
  ipcRenderer.removeAllListeners('send-msg-to-client');
  ipcRenderer.removeAllListeners('new-contact');
  ipcRenderer.removeAllListeners('received-msg-from-client');
  ipcRenderer.removeAllListeners('switch-account');
  ipcRenderer.removeAllListeners('clean-cache');
  ipcRenderer.removeAllListeners('send-notification');
};
