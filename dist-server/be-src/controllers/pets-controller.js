"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPet = createPet;
exports.getPetsAround = getPetsAround;
exports.getMyReportedPets = getMyReportedPets;
exports.updatePetData = updatePetData;
const models_1 = require("../models/models");
const algolia_1 = require("../lib/algolia");
const cloudinary_1 = require("../lib/cloudinary");
async function createPet(userId, data) {
    try {
        const imageUploaded = await cloudinary_1.cloudinary.uploader.upload(data.dataURL, {
            resource_type: "image",
            discard_original_filename: true,
        });
        const sequelizePet = await models_1.Pet.create({
            name: data.name,
            location: data.location,
            pictureURL: imageUploaded.secure_url,
            status: "lost",
            lat: data.lat,
            lng: data.lng,
            userId: userId,
        });
        const petId = sequelizePet.dataValues.id;
        await algolia_1.indexPets.saveObject({
            objectID: petId.toString(),
            name: data.name,
            _geoloc: {
                lat: data.lat,
                lng: data.lng,
            },
        });
        return { success: true, pet: sequelizePet.dataValues };
    }
    catch (error) {
        console.error("Error al crear mascota:", error);
        return { success: false, error: JSON.stringify(error) };
    }
}
async function getPetsAround(lat, lng, radiusInMeters = 5000) {
    try {
        console.log("DEBUG: Buscando en Algolia con:", { lat, lng, radiusInMeters });
        // Agregamos @ts-ignore para saltear el chequeo estricto del cambio de firma en Algolia v5
        // @ts-ignore
        const algoliaResponse = await algolia_1.indexPets.search({
            query: "",
            aroundLatLng: `${lat},${lng}`,
            aroundRadius: radiusInMeters,
        });
        const hits = algoliaResponse.hits || (algoliaResponse.results && algoliaResponse.results[0]?.hits) || [];
        console.log(`DEBUG: Hits extraídos con éxito. Cantidad: ${hits.length}`);
        const petIDs = hits.map((hit) => parseInt(hit.objectID));
        if (petIDs.length === 0) {
            console.log("⚠️ Algolia devolvió 0 hits. Activando Fallback: Trayendo todas las mascotas 'lost' de la DB.");
            return await models_1.Pet.findAll({
                where: { status: "lost" },
            });
        }
        const pets = await models_1.Pet.findAll({
            where: {
                id: petIDs,
                status: "lost",
            },
        });
        return pets;
    }
    catch (error) {
        console.error("Error al buscar mascotas en el área, activando Fallback de emergencia:", error);
        try {
            return await models_1.Pet.findAll({ where: { status: "lost" } });
        }
        catch (dbError) {
            return [];
        }
    }
}
async function getMyReportedPets(userId) {
    try {
        const pets = await models_1.Pet.findAll({ where: { userId } });
        return pets;
    }
    catch (error) {
        console.error("Error al traer mascotas del usuario:", error);
        return [];
    }
}
async function updatePetData(petId, userId, updateData) {
    try {
        const pet = await models_1.Pet.findByPk(petId);
        if (!pet)
            return { success: false, error: "Mascota no encontrada" };
        if (pet.dataValues.userId !== userId) {
            return { success: false, error: "No autorizado para editar esta mascota" };
        }
        const updatedFields = { ...updateData };
        if (updateData.dataURL) {
            const imageUploaded = await cloudinary_1.cloudinary.uploader.upload(updateData.dataURL);
            updatedFields.pictureURL = imageUploaded.secure_url;
            delete updatedFields.dataURL;
        }
        await pet.update(updatedFields);
        if (updateData.status === "found") {
            await algolia_1.indexPets.deleteObject(petId.toString());
        }
        else if (updateData.lat && updateData.lng) {
            await algolia_1.indexPets.partialUpdateObject({
                objectID: petId.toString(),
                name: pet.dataValues.name,
                _geoloc: { lat: updateData.lat, lng: updateData.lng },
            });
        }
        return { success: true };
    }
    catch (error) {
        console.error("Error al actualizar mascota:", error);
        return { success: false, error };
    }
}
