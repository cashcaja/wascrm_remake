import Store from 'electron-store';

const homeDirectory = process.env.HOME || process.env.USERPROFILE;

const store = new Store({
  cwd: `${homeDirectory}/.cache/dcs/store`,
});

export default store;
