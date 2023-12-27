import {Client} from 'whatsapp-web.js';
import type {Chat, ClientOptions} from 'whatsapp-web.js';
import find from 'lodash/find';
import {getAIResponse} from '/@/apis/ai';
import {type BrowserWindow, ipcMain} from 'electron';
import dayjs from 'dayjs';
import store from '/@/store';

class WhatsAppWeb {
  client: Client;
  allChats: Chat[] = [];
  chatHistory: ChatHistory[] = [];
  win: BrowserWindow;
  persistId: string;
  appPkg: string;
  country: string;
  csid: string;
  csemail: string;
  robot: boolean;

  constructor(
    win: BrowserWindow,
    persistId: string,
    appPkg: string,
    country: string,
    csid: string,
    csemail: string,
    robot: boolean,
    opts: ClientOptions,
  ) {
    console.log('instance robot client');
    this.client = new Client(opts);
    this.client.initialize();
    this.win = win;
    this.persistId = persistId;
    this.appPkg = appPkg;
    this.country = country;
    this.csemail = csemail;
    this.csid = csid;
    this.robot = robot;

    // registry ipc event
    this.listenGetQrCode();
    this.listenDestroyClient();

    // on login success
    this.client.on('authenticated', async () => {
      this.win.webContents.send('send-login-status', 'success');
      // 打开ai职守和埋点上传
      this.receiveMessage();
      // add wa account to store
      this.getWaAccount();
    });
  }

  public listenGetQrCode() {
    this.client.on('qr', qr => {
      console.log('recive qr code', qr);
      this.win.webContents.send('send-qr-code', qr);
    });
  }

  public getChats = async () => {
    const allChats = await this.client.getChats();
    this.allChats = allChats;
    const tempAllChats: ChatHistory[] = [];
    allChats.forEach(i => {
      if (!find(this.chatHistory, {id: i.id.user})) {
        tempAllChats.push({
          id: i.id.user,
          chat: i,
          allMsg: [],
        });
      }
    });
    if (tempAllChats.length > 0) {
      this.chatHistory = this.chatHistory.concat(tempAllChats);
    }
  };

  public listenDestroyClient() {
    ipcMain.on('destroy-client', async (_, persistId: string) => {
      if (this.persistId === persistId) {
        try {
          console.log('destory client', persistId);
          let accountList = store.get('accountList') as WaClient[];
          accountList = accountList.filter(i => i?.persistId !== persistId);
          store.set('accountList', accountList);
          this.win.webContents.send('send-accountList', accountList);
          await this.client.destroy();
        } catch (e: any) {
          console.log(e.toString());
        }
      }
    });
  }

  public getWaAccount() {
    const accountList = store.get('accountList') as WaClient[];
    accountList.forEach(i => {
      if (this.persistId === i.persistId) {
        i.waAccount = this.client.info.wid.user;
      }
    });
    store.set('accountList', accountList);
    this.win.webContents.send('send-accountList', accountList);
  }

  public receiveMessage() {
    this.client.on('message', async message => {
      // ensure not duplicate
      await this.getChats();
      const targetChatUserInfo = await message.getContact();
      if (this.chatHistory.length > 0) {
        for (const i of this.chatHistory) {
          if (i.id === targetChatUserInfo.number && i.id !== this.client.info.wid.user) {
            // add user ask to history
            i.allMsg.push({ask: message.body, time: message.timestamp});
            console.log('country --- appPkg', this.country, this.appPkg);

            const aiParams = {
              query: message.body,
              uid: targetChatUserInfo.number,
              app_pkg: this.appPkg,
              wa_phone: this.client.info.wid.user,
            };
            let res;
            try {
              res = await getAIResponse(aiParams);
            } catch (e) {
              console.log('ai response error--->', e);
            }
            console.log('ai response--->', res);
            await message.reply(
              res?.data?.reply
                ? res?.data?.reply
                : process.argv.includes('DEBUG') // debug mode will get msg
                  ? res?.data
                  : 'error', // product
            );
            // add ai response to history
            i.allMsg.push({
              answer: res?.data?.reply,
              time: dayjs().valueOf(),
            });
          }
        }
      }

      this.win.webContents.send('send-talk-history', {
        persistId: this.persistId,
        history: JSON.stringify(this.chatHistory),
      });
    });
  }
}

export default WhatsAppWeb;
