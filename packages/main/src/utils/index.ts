import {type BrowserWindow} from 'electron';
import {randomUUID} from 'node:crypto';
import {LocalAuth} from 'whatsapp-web.js';
import WhatsAppWeb from '/@/utils/whatsappClient';
import store from '/@/store';
import {rimraf} from 'rimraf';
import {join} from 'path';

const homeDirectory = process.env.HOME || process.env.USERPROFILE;
const instanceList: WhatsAppWeb[] = [];
export const addAccount = (win: BrowserWindow, opt: WaClient) => {
  console.log('add account', opt);

  // 如果是切换状态要把删除状态给清零
  if (opt?.delete) {
    opt.delete = false;
  }
  // create or load session persistId
  if (!opt?.persistId) {
    opt.persistId = randomUUID();
  }
  // proxy config
  const proxyOpt = {args: ['--no-sandbox']};
  if (opt?.host && opt?.port) {
    proxyOpt.args.push(`--proxy-server=${opt?.host}:${opt?.port}`);
  }

  if (opt?.username && opt?.password) {
    proxyOpt.args.push(`--proxy-auth=${opt?.username}:${opt?.password})`);
  }
  try {
    const robotInstance = new WhatsAppWeb(
      win,
      opt.persistId,
      opt.appPkg,
      opt.country,
      opt.csid,
      opt.csemail,
      opt.isRobot,
      {
        authStrategy: new LocalAuth({
          clientId: opt.persistId,
          dataPath: `${homeDirectory}/.cache/dcs/auth_data/${opt.persistId}`,
        }),
        puppeteer: {
          ...proxyOpt,
        },
      },
    );
    instanceList.push(robotInstance);
  } catch (e) {
    console.log('error---->', e);
  }

  const viewList = store.get('accountList') as WaClient[];
  const accountListView: WaClient[] = viewList ? viewList : [];
  accountListView.push({
    ...opt,
    persistId: opt.persistId,
    isRobot: opt.isRobot,
  });

  // send all agent to front end
  store.set('accountList', accountListView);
  // send browser list to renderer process
  win.webContents.send('send-accountList', accountListView);
};

export const startup = (win: BrowserWindow) => {
  const browserList = store.get('accountList') as WaClient[];
  store.set('accountList', []);
  if (browserList?.length > 0) {
    browserList.forEach(i => {
      addAccount(win, {
        persistId: i.persistId,
        appPkg: i.appPkg,
        country: i.country,
        csemail: i.csemail,
        csid: i.csid,
        isRobot: i.isRobot,
        img: i.img,
      });
    });
  }
};

export const closeInstance = (persistId: string) => {
  const instance = instanceList.find(i => i.persistId === persistId);
  if (instance) {
    instance.client.destroy();
  }
  const accountList = store.get('accountList') as WaClient[];
  const newAccountList = accountList.filter(i => i.persistId !== persistId);
  store.set('accountList', newAccountList);
};

export const distributionMsgWithSend = (persisId: string, msg: string, to: string) => {
  const instance = instanceList.find(i => i.persistId === persisId);
  if (instance) {
    return instance.sendMsg(to, msg);
  } else {
    return Promise.reject('no instance');
  }
};

export const newContact = (persisId: string, contact: string, msg: string) => {
  const instance = instanceList.find(i => i.persistId === persisId);
  if (instance) {
    return instance.newContact(`${contact}@c.us`, msg);
  }
};

export const switchAccount = (persistId: string) => {
  const instance = instanceList.find(i => i.persistId === persistId);
  if (instance) {
    instance.switchAccount();
  }

  const accountList = store.get('accountList') as WaClient[];
  const newAccountList = accountList.map(i => {
    if (i.persistId === persistId) {
      i.isRobot = !i.isRobot;
    }
    return i;
  });
  console.log('update account list', newAccountList);
  store.set('accountList', newAccountList);
};

export const cleanCache = () => {
  return rimraf(join(homeDirectory as string, '.cache/dcs'));
};

export const sleep = (time: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
