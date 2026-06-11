"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = signUp;
exports.getToken = getToken;
exports.getUserData = getUserData;
exports.updateUserData = updateUserData;
exports.updateUserPassword = updateUserPassword;
const models_1 = require("../models/models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;
async function signUp(data) {
    try {
        const existingAuth = await models_1.Auth.findOne({ where: { email: data.email } });
        if (existingAuth) {
            return { message: "User already existed", id: existingAuth.dataValues.userId };
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
        const user = await models_1.User.create({
            name: data.name,
            email: data.email
        });
        const auth = await models_1.Auth.create({
            email: data.email,
            password: hashedPassword,
            userId: user.dataValues.id
        });
        return { message: "New User created", id: user.dataValues.id };
    }
    catch (error) {
        console.error("Error en signUp controller:", error);
        return { message: "Something went wrong", error: JSON.stringify(error) };
    }
}
async function getToken(data) {
    const response = {
        message: "Something went wrong",
        token: "",
    };
    if (!SECRET) {
        response.message = "Secret missing";
        return response;
    }
    try {
        const auth = await models_1.Auth.findOne({ where: { email: data.email } });
        if (!auth) {
            response.message = "Wrong email or password";
            return response;
        }
        const match = await bcryptjs_1.default.compare(data.password, auth.dataValues.password);
        if (match) {
            const token = jsonwebtoken_1.default.sign({ userId: auth.dataValues.userId }, SECRET, { expiresIn: "1d" });
            return { message: "Ok", token };
        }
        else {
            response.message = "Wrong email or password";
            return response;
        }
    }
    catch (error) {
        response.message += ` error: ${JSON.stringify(error)}`;
        return response;
    }
}
async function getUserData(id) {
    try {
        const user = await models_1.User.findByPk(id);
        return user ? user.dataValues : null;
    }
    catch (error) {
        console.error("Error en getUserData:", error);
        return null;
    }
}
async function updateUserData(data) {
    try {
        const user = await models_1.User.findByPk(data.id);
        if (user) {
            await user.update(data);
            return { success: true };
        }
        return { success: false, error: "User not found" };
    }
    catch (error) {
        return { success: false, error };
    }
}
async function updateUserPassword(data) {
    try {
        const auth = await models_1.Auth.findOne({ where: { userId: data.id } });
        if (!auth)
            return { passwordCheck: false, error: "Auth missing" };
        const match = await bcryptjs_1.default.compare(data.password, auth.dataValues.password);
        if (match) {
            const newHashedPassword = await bcryptjs_1.default.hash(data.newPassword, SALT_ROUNDS);
            await auth.update({ password: newHashedPassword });
            return { passwordCheck: true };
        }
        else {
            return { passwordCheck: false, message: "Contraseña actual incorrecta" };
        }
    }
    catch (error) {
        return { passwordCheck: false, error };
    }
}
