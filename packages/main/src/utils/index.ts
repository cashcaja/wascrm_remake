import {type BrowserWindow} from 'electron';
import {randomUUID} from 'node:crypto';
import {LocalAuth} from 'whatsapp-web.js';
import WhatsAppWeb from '/@/utils/whatsappClient';
import store from '/@/store';

const homeDirectory = process.env.HOME || process.env.USERPROFILE;
const aiRobotList: WhatsAppWeb[] = [];
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
    aiRobotList.push(robotInstance);
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
