import { DataTypes } from "sequelize";
import { sequelize } from "../lib/sequalize";
export const Pet = sequelize.define("pet", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("lost", "found"),
        allowNull: false,
        defaultValue: "lost",
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pictureURL: {
        type: DataTypes.STRING(500),
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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {});
