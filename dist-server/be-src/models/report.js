"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const sequelize_1 = require("sequelize");
const sequalize_1 = require("../lib/sequalize");
exports.Report = sequalize_1.sequelize.define("report", {
    reporterName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    reporterPhone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    locationDescription: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    lat: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    lng: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    petId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {});
