import {Sequelize, DataTypes, Model} from 'sequelize';

const homeDirectory = process.env.HOME || process.env.USERPROFILE;
const path = `${homeDirectory}/.cache/dcs/db.sqlite`;

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path,
});

class AccountModel extends Model {
  public id!: number;
  public persistId!: string;
  public appPkg!: string;
  public country!: string;
  public csid!: string;
  public csemail!: string;
  public isRobot!: boolean;
  public waAccount!: string;
  public img!: string;
  public host!: string;
  public port!: number;
  public username!: string;
  public password!: string;
}

// account list table
export const AccountsList = AccountModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    persistId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appPkg: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    csid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    csemail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRobot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    waAccount: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    host: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'account_list',
  },
);
