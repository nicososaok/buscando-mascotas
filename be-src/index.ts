import express, { NextFunction, Request, Response, json } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { signUp, getToken, getUserData, updateUserData, updateUserPassword } from "./controllers/users-controller.js";
import { createPet, getPetsAround, getMyReportedPets, updatePetData } from "./controllers/pets-controller.js";
import { createReport, getPetReports } from "./controllers/reports-controller.js";
import { initDatabase } from "./db/index.js";

const app = express();
const port = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

app.use(json({ limit: "50mb" }));
app.use(cors());

interface CustomRequest extends Request {
   _userId?: number;
}

function checkToken(req: CustomRequest, res: Response, next: NextFunction) {
   const authHeader = req.get("Authorization");
   const token = authHeader?.split(" ")[1];

   if (!token || !SECRET) {
      return res.status(401).json({ error: "Access denied. Token missing." });
   }

   try {
      const decoded = jwt.verify(token, SECRET) as { userId: number };
      req._userId = decoded.userId;
      next();
   } catch (error) {
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

   const response = await signUp({ name, email, password });
   if (response.error) return res.status(400).json(response);

   const tokenObject = await getToken({ email, password });
   return res.json({ message: response.message, token: tokenObject.token });
});

app.post("/auth/signin", async (req, res) => {
   const { email, password } = req.body;
   if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
   }

   const tokenObject = await getToken({ email, password });
   if (tokenObject.token) {
      return res.json({ token: tokenObject.token });
   } else {
      return res.status(400).json({ error: tokenObject.message });
   }
});

app.patch("/auth/password", checkToken, async (req: CustomRequest, res) => {
   const { password, newPassword } = req.body;
   const userId = req._userId!;

   if (!password || !newPassword) {
      return res.status(400).json({ error: "Both old and new passwords are required." });
   }

   const response = await updateUserPassword({ id: userId, password, newPassword });
   if (response.passwordCheck) {
      return res.json({ message: "Password updated successfully" });
   } else {
      return res.status(400).json({ error: response.message || "Something went wrong" });
   }
});

/* ENDPOINTS DE USUARIO */

app.get("/user/profile", checkToken, async (req: CustomRequest, res) => {
   const data = await getUserData(req._userId!);
   if (!data) return res.status(404).json({ error: "User not found" });
   return res.json(data);
});

app.patch("/user/profile", checkToken, async (req: CustomRequest, res) => {
   const { name, location } = req.body;
   const response = await updateUserData({ id: req._userId!, name, location });
   if (response.success) return res.json({ message: "User info updated" });
   return res.status(400).json({ error: response.error });
});

/* ENDPOINTS DE MASCOTAS */

app.post("/pets", checkToken, async (req: CustomRequest, res) => {
   const { name, location, lat, lng, dataURL } = req.body;
   if (!name || !location || !lat || !lng || !dataURL) {
      return res.status(400).json({ error: "Missing data fields for creating pet." });
   }

   const response = await createPet(req._userId!, { name, location, lat, lng, dataURL });
   if (response.success) return res.status(201).json(response);
   return res.status(400).json({ error: response.error });
});

app.get("/pets/around", async (req, res) => {
   const { lat, lng, radius } = req.query;
   if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude required in query parameters." });
   }

   const pets = await getPetsAround(Number(lat), Number(lng), radius ? Number(radius) : undefined);
   return res.json(pets);
});

app.get("/user/pets", checkToken, async (req: CustomRequest, res) => {
   const pets = await getMyReportedPets(req._userId!);
   return res.json(pets);
});

app.patch("/pets/:petId", checkToken, async (req: CustomRequest, res) => {
   const { petId } = req.params;
   const response = await updatePetData(Number(petId), req._userId!, req.body);

   if (response.success) return res.json({ message: "Pet updated correctly" });
   return res.status(400).json({ error: response.error });
});

/* ENDPOINTS DE AVISTAJES */

app.post("/reports", async (req, res) => {
   const { petId, reporterName, reporterPhone, locationDescription, lat, lng } = req.body;
   if (!petId || !reporterName || !reporterPhone || !locationDescription) {
      return res.status(400).json({ error: "Missing vital informant data." });
   }

   const response = await createReport({ petId, reporterName, reporterPhone, locationDescription, lat, lng });
   if (response.success) return res.json({ message: "Report created and email alert sent." });
   return res.status(400).json({ error: response.error });
});

app.get("/pets/:petId/reports", checkToken, async (req, res) => {
   const { petId } = req.params;
   const reports = await getPetReports(Number(petId));
   return res.json(reports);
});

/* SERVIDO DE ARCHIVOS ESTÁTICOS Y FRONTEND */

const distPath = path.resolve(__dirname, "../dist");

app.use(express.static(distPath));

app.get(/\*/, (req, res) => {
   res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

async function main() {
   try {
      console.log("⏳ Conectando e inicializando la Base de Datos...");
      await initDatabase();

      app.listen(port, () => {
         console.log(`🚀 Server fully operational on port ${port}`);
      });
   } catch (error) {
      console.error("💥 Error crítico al iniciar el sistema:", error);
   }
}

main();