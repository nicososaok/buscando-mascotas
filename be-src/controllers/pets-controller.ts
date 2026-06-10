import { Pet } from "../models/models";
import { indexPets } from "../lib/algolia";
import { cloudinary } from "../lib/cloudinary";

async function createPet(userId: number, data: {
   name: string;
   location: string;
   lat: number;
   lng: number;
   dataURL: string;
}) {
   try {
      const imageUploaded = await cloudinary.uploader.upload(data.dataURL, {
         resource_type: "image",
         discard_original_filename: true,
      });

      const sequelizePet = await Pet.create({
         name: data.name,
         location: data.location,
         pictureURL: imageUploaded.secure_url,
         status: "lost",
         lat: data.lat,
         lng: data.lng,
         userId: userId,
      });

      const petId = sequelizePet.dataValues.id;

      await indexPets.saveObject({
         objectID: petId.toString(),
         name: data.name,
         _geoloc: {
            lat: data.lat,
            lng: data.lng,
         },
      });

      return { success: true, pet: sequelizePet.dataValues };
   } catch (error) {
      console.error("Error al crear mascota:", error);
      return { success: false, error: JSON.stringify(error) };
   }
}

async function getPetsAround(lat: number, lng: number, radiusInMeters: number = 5000) {
   try {
      console.log("DEBUG: Buscando en Algolia con:", { lat, lng, radiusInMeters });

      // Agregamos @ts-ignore para saltear el chequeo estricto del cambio de firma en Algolia v5
      // @ts-ignore
      const algoliaResponse: any = await indexPets.search({
         query: "",
         aroundLatLng: `${lat},${lng}`,
         aroundRadius: radiusInMeters,
      });

      const hits = algoliaResponse.hits || (algoliaResponse.results && algoliaResponse.results[0]?.hits) || [];

      console.log(`DEBUG: Hits extraídos con éxito. Cantidad: ${hits.length}`);

      const petIDs = hits.map((hit: any) => parseInt(hit.objectID));
      if (petIDs.length === 0) {
         console.log("⚠️ Algolia devolvió 0 hits. Activando Fallback: Trayendo todas las mascotas 'lost' de la DB.");
         return await Pet.findAll({
            where: { status: "lost" },
         });
      }

      const pets = await Pet.findAll({
         where: {
            id: petIDs,
            status: "lost",
         },
      });

      return pets;
   } catch (error) {
      console.error("Error al buscar mascotas en el área, activando Fallback de emergencia:", error);
      try {
         return await Pet.findAll({ where: { status: "lost" } });
      } catch (dbError) {
         return [];
      }
   }
}

async function getMyReportedPets(userId: number) {
   try {
      const pets = await Pet.findAll({ where: { userId } });
      return pets;
   } catch (error) {
      console.error("Error al traer mascotas del usuario:", error);
      return [];
   }
}

async function updatePetData(petId: number, userId: number, updateData: {
   name?: string;
   location?: string;
   status?: "lost" | "found";
   lat?: number;
   lng?: number;
   dataURL?: string;
}) {
   try {
      const pet = await Pet.findByPk(petId);
      if (!pet) return { success: false, error: "Mascota no encontrada" };

      if (pet.dataValues.userId !== userId) {
         return { success: false, error: "No autorizado para editar esta mascota" };
      }

      const updatedFields: any = { ...updateData };

      if (updateData.dataURL) {
         const imageUploaded = await cloudinary.uploader.upload(updateData.dataURL);
         updatedFields.pictureURL = imageUploaded.secure_url;
         delete updatedFields.dataURL;
      }

      await pet.update(updatedFields);

      if (updateData.status === "found") {
         await indexPets.deleteObject(petId.toString());
      } else if (updateData.lat && updateData.lng) {

         await indexPets.partialUpdateObject({
            objectID: petId.toString(),
            name: pet.dataValues.name,
            _geoloc: { lat: updateData.lat, lng: updateData.lng },
         });
      }
      return { success: true };
   } catch (error) {
      console.error("Error al actualizar mascota:", error);
      return { success: false, error };
   }
}

export { createPet, getPetsAround, getMyReportedPets, updatePetData };