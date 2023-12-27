import {type BrowserWindow} from 'electron';
import url from 'node:url';
import {jwtDecode} from 'jwt-decode';
import store from '/@/store';
import axios from 'axios';

// auth action

const auth0Domain = 'mobene.us.auth0.com';
const clientId = '24TpzzMRXuKTsVgrB5TQd8gbV9u2Epz0';
const redirectUri = 'dcs://open';

let refreshToken = null;

export const refreshTokens = async () => {
  const refreshToken = store.get('refreshToken') as string | null;

  if (refreshToken) {
    const refreshOptions = {
      method: 'POST',
      url: `https://${auth0Domain}/oauth/token`,
      headers: {'content-type': 'application/json'},
      data: {
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: refreshToken,
      },
    };

    try {
      await axios(refreshOptions);
    } catch (error) {
      await logout();

      throw error;
    }
  } else {
    throw new Error('No available refresh token.');
  }
};

export const loadTokens = async (win: BrowserWindow, callbackURL: string) => {
  console.log(callbackURL);
  const urlParts = url.parse(callbackURL, true);
  const query = urlParts?.query;

  const exchangeOptions = {
    grant_type: 'authorization_code',
    client_id: clientId,
    scope: 'openid profile email offline_access',
    code: query.code,
    redirect_uri: redirectUri,
    audience: 'https://ai-assist-test-us.wuli.cash/',
  };

  const options = {
    method: 'POST',
    url: `https://${auth0Domain}/oauth/token`,
    headers: {
      'content-type': 'application/json',
    },
    data: JSON.stringify(exchangeOptions),
  };

  try {
    const response = await axios(options);

    const token = response.data?.access_token;

    const userInfo = jwtDecode(response.data?.id_token);
    store.set('userInfo', userInfo);
    // send userInfo to front end
    win.webContents.send('save-user-info-to-front', {...userInfo, token});

    // TODO delete this testing auth api
    // try {
    //   await axios({
    //     method: 'GET',
    //     url: 'http://auth0-test.wuli.cash:28090/',
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });
    // } catch (e) {
    //   console.log(e);
    // }

    refreshToken = response.data.refresh_token;

    if (refreshToken) {
      store.set('refreshToken', refreshToken);
    }
  } catch (error) {
    console.log(error);
    await logout();

    throw error;
  }
};

export const logout = async () => {
  store.set('refreshToken', null);
  refreshToken = null;
};
