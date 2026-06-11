"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sgMail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
exports.sgMail = mail_1.default;
const sendGridAPIKey = process.env.SENDGRID_API_KEY;
if (typeof sendGridAPIKey == "string")
    mail_1.default.setApiKey(sendGridAPIKey);
else
    throw new Error("Sendgrid API Key missing");
