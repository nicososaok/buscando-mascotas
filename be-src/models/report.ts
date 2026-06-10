import { DataTypes } from "sequelize";
import { sequelize } from "../lib/sequalize";

export const Report = sequelize.define("report", {
  reporterName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reporterPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  locationDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {

});