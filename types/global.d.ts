interface WaClient {
  isRobot: boolean;
  persistId: string;
  name?: string;
  delete?: boolean;
  img?: string;
  appPkg: string;
  country: string;
  csid: string;
  csemail: string;
  waAccount?: string;
  host?: string;
  port?: number | null;
  username?: string;
  password?: string;
}

interface ChatHistory {
  id: string | number; // this is the user phone number
  chat: any;
  allMsg: (Ask | Answer)[];
}

interface Answer {
  answer: string;
  time: number;
}

interface Ask {
  ask: string;
  time: number;
}

interface TalkHistory {
  persistId: string;
  history: string;
}

interface AppInfo {
  id: number;
  appName: string;
  appPkg: string;
  onlineServiceWa: string;
  botWa?: string;
  country: string;
  label: string;
  value: string;
  robot: boolean;
}

interface UserInfo {
  sub: string;
  email: string;
  'https://ai-assist-test-us.wuli.cash/roles': string[];
  nickname: string;
  picture: string;
  token: string;
}

interface Talk {
  type: string;
  msg: string;
  timestamp: number | string;
  me: string; // current wa account user not customer wa account
  to: string;
  failed?: boolean;
}
