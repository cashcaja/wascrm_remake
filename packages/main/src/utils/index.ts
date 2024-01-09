import {type BrowserWindow, Notification} from 'electron';
import {randomUUID} from 'node:crypto';
import {LocalAuth} from 'whatsapp-web.js';
import WhatsAppWeb from '/@/utils/whatsappClient';
import {rimraf} from 'rimraf';
import {join} from 'path';
import {
  deleteAccount,
  findAccount,
  getAccountList,
  insertAccount,
  testConnectWithSqlite,
  updateAccount,
} from '/@/utils/db';

const homeDirectory = process.env.HOME || process.env.USERPROFILE;
const instanceList: WhatsAppWeb[] = [];
export const addAccount = async (win: BrowserWindow, opt: WaClient, isNew: boolean = true) => {
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

  if (isNew) {
    // insert account
    await insertAccount([
      {
        ...opt,
        persistId: opt.persistId,
        isRobot: opt.isRobot,
      },
    ]);
  }

  // send all agent to front end
  const accountList = await getAccountList();
  // send browser list to renderer process
  win.webContents.send('send-accountList', accountList);
};

export const startup = async (win: BrowserWindow) => {
  try {
    testConnectWithSqlite();
    const allAccounts = await getAccountList();
    if (allAccounts?.length > 0) {
      allAccounts.forEach(i => {
        addAccount(
          win,
          {
            persistId: i.persistId,
            appPkg: i.appPkg,
            country: i.country,
            csemail: i.csemail,
            csid: i.csid,
            isRobot: i.isRobot,
            img: i.img,
          },
          false,
        );
      });
    }
  } catch (e) {
    console.log('startup error', e);
  }
};

export const closeInstance = async (persistId: string) => {
  const instance = instanceList.find(i => i.persistId === persistId);
  if (instance) {
    instance.client.destroy();
  }
  await deleteAccount(persistId);
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

export const switchAccount = async (persistId: string) => {
  const instance = instanceList.find(i => i.persistId === persistId);
  if (instance) {
    // instance is robot status
    instance.switchAccount();
  }

  // update db
  const account = await findAccount(persistId);
  if (account) {
    await updateAccount(persistId, {isRobot: !account.isRobot});
  }
};

export const cleanCache = async () => {
  const accountList = await getAccountList();
  accountList.forEach(i => {
    deleteAccount(i.persistId);
  });
  for (const i of instanceList) {
    await i?.client?.destroy();
  }
  rimraf(join(homeDirectory as string, '.cache/dcs/store'));
  rimraf(join(homeDirectory as string, '.cache/dcs/auth_data'));
};

export const sendNotification = (title: string, body: string) => {
  const notification = new Notification({title, body});
  notification.show();
};

export const sleep = (time: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
