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
    this.client.on('ready', async () => {
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
  public sendMsg(to: string, msg: string) {
    return this.client.sendMessage(to, msg);
  }

  public async newContact(to: string, msg: string) {
    console.log('---->', to, msg);
    const contact = await this.client.getContactById(to);
    if (contact.isWAContact) {
      console.log('send ---->');
      const sendRes = await this.client.sendMessage(to, msg);
      await this.getChats();
      return sendRes;
    } else {
      return {msg: 'not a wa contact', status: 'error'};
    }
  }

  public switchAccount() {
    this.isRobot = !this.isRobot;
  }

  public receiveMessage() {
    this.client.on('message', async message => {
      this.win.webContents.send('received-msg-from-client', {
        persistId: this.persistId,
        msg: message.body,
        from: message.from,
        time: message.timestamp,
        to: message.to,
        me: message.fromMe ? message.from : message.to,
      });
    });
  }
}

export default WhatsAppWeb;
