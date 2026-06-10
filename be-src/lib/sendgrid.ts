import sgMail from "@sendgrid/mail";

const sendGridAPIKey = process.env.SENDGRID_API_KEY;

if (typeof sendGridAPIKey == "string") sgMail.setApiKey(sendGridAPIKey);
else throw new Error("Sendgrid API Key missing");

export { sgMail };