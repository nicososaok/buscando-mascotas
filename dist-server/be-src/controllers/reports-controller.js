import { Auth, Report, Pet } from "../models/models";
import { sgMail } from "../lib/sendgrid.js";
async function createReport(data) {
    try {
        const newReport = await Report.create({
            reporterName: data.reporterName,
            reporterPhone: data.reporterPhone,
            locationDescription: data.locationDescription,
            lat: data.lat || null,
            lng: data.lng || null,
            petId: data.petId,
        });
        const pet = await Pet.findByPk(data.petId);
        if (!pet)
            throw new Error("Mascota no encontrada");
        const authOwner = await Auth.findOne({ where: { userId: pet.dataValues.userId } });
        if (authOwner && authOwner.dataValues.email) {
            const msg = {
                to: authOwner.dataValues.email,
                from: "nsosadevfs@gmail.com",
                subject: `⚠️ ¡Avistaje reportado para tu mascota: ${pet.dataValues.name}!`,
                html: `
               <h2>Alguien vio a tu mascota</h2>
               <p><strong>Nombre de quien la vio:</strong> ${data.reporterName}</p>
               <p><strong>Teléfono de contacto:</strong> ${data.reporterPhone}</p>
               <p><strong>Detalles del lugar:</strong> ${data.locationDescription}</p>
               <br/>
               <p>Ponete en contacto lo antes posible. ¡Muchos éxitos!</p>
            `,
            };
            await sgMail.send(msg);
            console.log("📧 Mail de avistaje enviado correctamente al dueño");
        }
        return { success: true, reportId: newReport.dataValues.id };
    }
    catch (error) {
        console.error("Error al crear reporte de avistaje:", error);
        return { success: false, error: JSON.stringify(error) };
    }
}
async function getPetReports(petId) {
    try {
        const reports = await Report.findAll({ where: { petId } });
        return reports;
    }
    catch (error) {
        console.error("Error en getPetReports:", error);
        return [];
    }
}
export { createReport, getPetReports };
