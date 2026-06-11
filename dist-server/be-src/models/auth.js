"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const sequelize_1 = require("sequelize");
const sequalize_1 = require("../lib/sequalize");
exports.Auth = sequalize_1.sequelize.define("auth", {
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {});
