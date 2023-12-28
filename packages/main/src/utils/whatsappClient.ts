import {Client} from 'whatsapp-web.js';
import type {ClientOptions} from 'whatsapp-web.js';
import {type BrowserWindow} from 'electron';
import store from '/@/store';

class WhatsAppWeb {
  client: Client;
  win: BrowserWindow;
  persistId: string;
  appPkg: string;
  country: string;
  csid: string;
  csemail: string;
  isRobot: boolean;

  constructor(
    win: BrowserWindow,
    persistId: string,
    appPkg: string,
    country: string,
    csid: string,
    csemail: string,
    isRobot: boolean,
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
    this.isRobot = isRobot;

    // registry ipc event
    this.listenGetQrCode();

    // on login success
    this.client.on('authenticated', async () => {
      this.win.webContents.send('login-success');
    });

    // on ready message
    this.client.on('ready', () => {
      this.win.webContents.send('set-loading', false);
      // 打开ai职守和埋点上传
      this.receiveMessage();
      // add wa account to store
      this.getWaAccount();
      // api get all chats
      this.getChats();
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
    this.win.webContents.send('send-talk-history', {
      persistId: this.persistId,
      history: JSON.stringify(allChats),
    });
  };

  public async getWaAccount(): Promise<any> {
    const accountList = store.get('accountList') as WaClient[];
    if (!this.client?.info?.wid) {
      console.log('retry get wa account', this.client?.info?.wid);
      return this.getWaAccount();
    }
    try {
      const img = await this.client.getProfilePicUrl(this.client.info.wid._serialized);
      accountList.forEach(i => {
        if (this.persistId === i.persistId) {
          i.waAccount = this.client.info.wid.user;
          i.img = img;
        }
      });
      store.set('accountList', accountList);
      this.win.webContents.send('send-accountList', accountList);
    } catch (e) {
      console.log('get wa account error', e);
    }
  }

  public receiveMessage() {
    // this.client.on('message', async message => {
    //   // ensure not duplicate
    //   await this.getChats();
    //   const targetChatUserInfo = await message.getContact();
    //   if (this.chatHistory.length > 0) {
    //     for (const i of this.chatHistory) {
    //       if (i.id === targetChatUserInfo.number && i.id !== this.client.info.wid.user) {
    //         // add user ask to history
    //         i.allMsg.push({ask: message.body, time: message.timestamp});
    //         console.log('country --- appPkg', this.country, this.appPkg);
    //
    //         const aiParams = {
    //           query: message.body,
    //           uid: targetChatUserInfo.number,
    //           app_pkg: this.appPkg,
    //           wa_phone: this.client.info.wid.user,
    //         };
    //         let res;
    //         try {
    //           res = await getAIResponse(aiParams);
    //         } catch (e) {
    //           console.log('ai response error--->', e);
    //         }
    //         console.log('ai response--->', res);
    //         await message.reply(
    //           res?.data?.reply
    //             ? res?.data?.reply
    //             : process.argv.includes('DEBUG') // debug mode will get msg
    //               ? res?.data
    //               : 'error', // product
    //         );
    //         // add ai response to history
    //         i.allMsg.push({
    //           answer: res?.data?.reply,
    //           time: dayjs().valueOf(),
    //         });
    //       }
    //     }
    //   }
    //
    //   this.win.webContents.send('send-talk-history', {
    //     persistId: this.persistId,
    //     history: JSON.stringify(this.chatHistory),
    //   });
    // });
  }
}

export default WhatsAppWeb;
