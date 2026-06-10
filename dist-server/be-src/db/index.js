import { sequelize } from "../models/models.js";
async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log("🔄 Conexión a la base de datos establecida exitosamente.");
        await sequelize.sync({ alter: true });
        console.log("✅ Todos los modelos se sincronizaron correctamente con la DB.");
    }
    catch (error) {
        console.error("❌ No se pudo conectar a la base de datos:", error);
        process.exit(1);
    }
}
export { initDatabase };
