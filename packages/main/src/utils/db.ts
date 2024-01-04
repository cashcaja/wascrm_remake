import {sequelize, AccountsList} from '/@/db';

export const testConnectWithSqlite = async () => {
  await sequelize.authenticate();
  try {
    await AccountsList.sync();
  } catch (e) {
    console.log('sync error', e);
  }
};

export const getAccountList = () => {
  return AccountsList.findAll({raw: true});
};

export const insertAccount = (account: any) => {
  return AccountsList.bulkCreate(account);
};

export const findAccount = (persistId: string) => {
  return AccountsList.findOne({where: {persistId}, raw: true});
};

export const updateAccount = (persistId: string, params: Partial<WaClient>) => {
  return AccountsList.update({...params}, {where: {persistId}});
};

export const deleteAccount = (persistId: string) => {
  return AccountsList.destroy({where: {persistId}});
};
