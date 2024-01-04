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
  customer: string;
  service: string;
  msg: string;
  from: string;
  timestamp: number;
  to: string;
  fromMe: boolean;
  failed?: boolean;
}

interface Proxy {
  host: string;
  port: number;
  username?: string;
  password?: string;
}
