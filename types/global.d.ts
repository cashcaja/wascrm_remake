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
