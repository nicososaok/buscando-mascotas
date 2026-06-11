"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
const models_js_1 = require("../models/models.js");
async function initDatabase() {
    try {
        await models_js_1.sequelize.authenticate();
        console.log("🔄 Conexión a la base de datos establecida exitosamente.");
        await models_js_1.sequelize.sync({ alter: true });
        console.log("✅ Todos los modelos se sincronizaron correctamente con la DB.");
    }
    catch (error) {
        console.error("❌ No se pudo conectar a la base de datos:", error);
        process.exit(1);
    }
}
