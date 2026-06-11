"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const sequalize_1 = require("../lib/sequalize");
exports.User = sequalize_1.sequelize.define("user", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {});
