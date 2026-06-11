"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("❌ ERROR: La variable de entorno DATABASE_URL no está configurada.");
}
const sequelize = new sequelize_1.Sequelize(DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: process.env.NODE_ENV === "production" ? {
            require: true,
            rejectUnauthorized: false,
        } : false,
    },
    logging: false,
});
exports.sequelize = sequelize;
