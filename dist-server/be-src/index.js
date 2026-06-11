"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const users_controller_js_1 = require("./controllers/users-controller.js");
const pets_controller_js_1 = require("./controllers/pets-controller.js");
const reports_controller_js_1 = require("./controllers/reports-controller.js");
const index_js_1 = require("./db/index.js");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;
app.use((0, express_1.json)({ limit: "50mb" }));
app.use((0, cors_1.default)());
function checkToken(req, res, next) {
    const authHeader = req.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token || !SECRET) {
        return res.status(401).json({ error: "Access denied. Token missing." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        req._userId = decoded.userId;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
app.get("/up", (req, res) => {
    res.send("Server up and running perfectly.");
});
/* ENDPOINTS DE AUTENTICACIÓN */
app.post("/auth/signup", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing information. Name, email and password required." });
    }
    const response = await (0, users_controller_js_1.signUp)({ name, email, password });
    if (response.error)
        return res.status(400).json(response);
    const tokenObject = await (0, users_controller_js_1.getToken)({ email, password });
    return res.json({ message: response.message, token: tokenObject.token });
});
app.post("/auth/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required." });
    }
    const tokenObject = await (0, users_controller_js_1.getToken)({ email, password });
    if (tokenObject.token) {
        return res.json({ token: tokenObject.token });
    }
    else {
        return res.status(400).json({ error: tokenObject.message });
    }
});
app.patch("/auth/password", checkToken, async (req, res) => {
    const { password, newPassword } = req.body;
    const userId = req._userId;
    if (!password || !newPassword) {
        return res.status(400).json({ error: "Both old and new passwords are required." });
    }
    const response = await (0, users_controller_js_1.updateUserPassword)({ id: userId, password, newPassword });
    if (response.passwordCheck) {
        return res.json({ message: "Password updated successfully" });
    }
    else {
        return res.status(400).json({ error: response.message || "Something went wrong" });
    }
});
/* ENDPOINTS DE USUARIO */
app.get("/user/profile", checkToken, async (req, res) => {
    const data = await (0, users_controller_js_1.getUserData)(req._userId);
    if (!data)
        return res.status(404).json({ error: "User not found" });
    return res.json(data);
});
app.patch("/user/profile", checkToken, async (req, res) => {
    const { name, location } = req.body;
    const response = await (0, users_controller_js_1.updateUserData)({ id: req._userId, name, location });
    if (response.success)
        return res.json({ message: "User info updated" });
    return res.status(400).json({ error: response.error });
});
/* ENDPOINTS DE MASCOTAS */
app.post("/pets", checkToken, async (req, res) => {
    const { name, location, lat, lng, dataURL } = req.body;
    if (!name || !location || !lat || !lng || !dataURL) {
        return res.status(400).json({ error: "Missing data fields for creating pet." });
    }
    const response = await (0, pets_controller_js_1.createPet)(req._userId, { name, location, lat, lng, dataURL });
    if (response.success)
        return res.status(201).json(response);
    return res.status(400).json({ error: response.error });
});
app.get("/pets/around", async (req, res) => {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude required in query parameters." });
    }
    const pets = await (0, pets_controller_js_1.getPetsAround)(Number(lat), Number(lng), radius ? Number(radius) : undefined);
    return res.json(pets);
});
app.get("/user/pets", checkToken, async (req, res) => {
    const pets = await (0, pets_controller_js_1.getMyReportedPets)(req._userId);
    return res.json(pets);
});
app.patch("/pets/:petId", checkToken, async (req, res) => {
    const { petId } = req.params;
    const response = await (0, pets_controller_js_1.updatePetData)(Number(petId), req._userId, req.body);
    if (response.success)
        return res.json({ message: "Pet updated correctly" });
    return res.status(400).json({ error: response.error });
});
/* ENDPOINTS DE AVISTAJES */
app.post("/reports", async (req, res) => {
    const { petId, reporterName, reporterPhone, locationDescription, lat, lng } = req.body;
    if (!petId || !reporterName || !reporterPhone || !locationDescription) {
        return res.status(400).json({ error: "Missing vital informant data." });
    }
    const response = await (0, reports_controller_js_1.createReport)({ petId, reporterName, reporterPhone, locationDescription, lat, lng });
    if (response.success)
        return res.json({ message: "Report created and email alert sent." });
    return res.status(400).json({ error: response.error });
});
app.get("/pets/:petId/reports", checkToken, async (req, res) => {
    const { petId } = req.params;
    const reports = await (0, reports_controller_js_1.getPetReports)(Number(petId));
    return res.json(reports);
});
/* SERVIDO DE ARCHIVOS ESTÁTICOS Y FRONTEND */
const distPath = path_1.default.resolve(__dirname, "../dist");
app.use(express_1.default.static(distPath));
app.get(/\*/, (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../dist/index.html"));
});
async function main() {
    try {
        console.log("⏳ Conectando e inicializando la Base de Datos...");
        await (0, index_js_1.initDatabase)();
        app.listen(port, () => {
            console.log(`🚀 Server fully operational on port ${port}`);
        });
    }
    catch (error) {
        console.error("💥 Error crítico al iniciar el sistema:", error);
    }
}
main();
