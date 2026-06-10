import { Sequelize } from "sequelize";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
   console.error("❌ ERROR: La variable de entorno DATABASE_URL no está configurada.");
}

const sequelize = new Sequelize(DATABASE_URL as string, {
   dialect: "postgres",
   dialectOptions: {
      ssl: process.env.NODE_ENV === "production" ? {
         require: true,
         rejectUnauthorized: false,
      } : false,
   },
   logging: false,
});

export { sequelize };