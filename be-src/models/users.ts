import { DataTypes, Model } from "sequelize";
import { sequelize } from "../lib/sequalize";

export const User = sequelize.define("user", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {

});