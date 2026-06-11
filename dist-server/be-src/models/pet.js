"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pet = void 0;
const sequelize_1 = require("sequelize");
const sequalize_1 = require("../lib/sequalize");
exports.Pet = sequalize_1.sequelize.define("pet", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("lost", "found"),
        allowNull: false,
        defaultValue: "lost",
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    pictureURL: {
        type: sequelize_1.DataTypes.STRING(500),
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
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {});
