import { state } from "../state";
import { goTo } from "../router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = type === "success" ? "#2ecc71" : "#ff5252";
    toast.style.color = "white";
    toast.style.padding = "14px 28px";
    toast.style.borderRadius = "8px";
    toast.style.fontFamily = "'Inter', sans-serif";
    toast.style.fontWeight = "bold";
    toast.style.fontSize = "15px";
    toast.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
    toast.style.zIndex = "99999";
    toast.style.transition = "opacity 0.3s ease";
    toast.innerText = (type === "success" ? "✅ " : "❌ ") + message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3000);
}
export function initReportPage() {
    const pageEl = document.createElement("div");
    pageEl.classList.add("page-report");
    const cs = state.getState();
    if (!cs.token) {
        setTimeout(() => goTo("/login"), 0);
        return pageEl;
    }
    const isEditMode = !!cs.currentPetToEdit;
    const petData = cs.currentPetToEdit || {};
    let imageDataURL = petData.pictureURL || "";
    let selectedLat = petData.lat || -34.7;
    let selectedLng = petData.lng || -58.4;
    pageEl.innerHTML = `
      <custom-header></custom-header>
      <custom-menu></custom-menu>
      
      <main class="report-container" style="max-width: 500px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; min-height: 80vh;">
         <h1 class="home-title" style="font-size: 32px; font-weight: 800; margin-bottom: 10px; text-align: center; color: #333;">
            ${isEditMode ? `Editar a ${petData.name}` : "Reportar mascota"}
         </h1>
         <p class="report-description" style="color: #666; text-align: center; margin-bottom: 30px; font-size: 15px; line-height: 1.4;">
            Ingresá los datos de la mascota y marcá el punto en el mapa donde se perdió por última vez.
         </p>
         
         <form class="report-form" id="report-form" style="display: flex; flex-direction: column; gap: 20px; text-align: left;">
            <div class="form-field" style="display: flex; flex-direction: column; gap: 6px;">
               <label class="form-label" style="font-weight: bold; font-size: 12px; color: #444;">NOMBRE</label>
               <input type="text" name="name" value="${petData.name || ""}" class="form-input" placeholder="Nombre de la mascota" required style="padding: 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; width: 100%;">
            </div>
            
            <div class="form-field">
               <label class="form-label" style="font-weight: bold; font-size: 12px; color: #444; display: block; margin-bottom: 6px;">FOTO DE LA MASCOTA</label>
               <div class="dropzone-container" id="dropzone" style="border: 2px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; background: #fafafa; background-size: cover; background-position: center; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; transition: border-color 0.2s;">
                  <input type="file" id="file-input" accept="image/*" style="display: none;">
                  <div id="dropzone-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; ${isEditMode && petData.pictureURL ? "display: none;" : ""}">
                     <svg class="dropzone-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width: 64px; height: 64px; fill: #8E8E8E; margin-bottom: 12px; opacity: 0.8;">
                        <path d="M464 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM48 96c-8.822 0-16 7.178-16 16v288c0 8.822 7.178 16 16 16h416c8.822 0 16-7.178 16-16V112c0-8.822-7.178-16-16-16H48zm304 96a48 48 0 1 0 0-96 48 48 0 0 0 0 96zm-48 16a32 32 0 1 1-64 0 32 32 0 0 1 64 0zm128 176H80v-40l104-104 56 56 120-120 72 72v136z"/>
                     </svg>
                     <p style="margin: 0; font-size: 14px; color: #666; font-weight: bold;">Click aquí para subir o arrastrar foto</p>
                  </div>
               </div>
            </div>

            <div class="form-field" style="display: flex; flex-direction: column; gap: 6px;">
               <label class="form-label" style="font-weight: bold; font-size: 12px; color: #444;">UBICACIÓN</label>
               <div id="map-container" style="width: 100%; height: 250px; background-color: #e5e5e5; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 8px; z-index: 1;"></div>
               <input type="text" name="location" value="${petData.location || ""}" class="form-input" placeholder="Buscá una ubicación o barrio de referencia" required style="padding: 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; width: 100%;">
            </div>

            <div style="margin-top: 15px; position: relative;">
               
               <div id="box-actions-default" style="display: flex; flex-direction: column; gap: 12px;">
                  <button type="submit" class="submit-button" style="background-color: #5A8FEC; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: background 0.2s;">
                     ${isEditMode ? "Guardar Cambios" : "Reportar Mascota"}
                  </button>
                  
                  ${isEditMode ? `
                     <button type="button" id="btn-mark-found" style="background-color: #2ecc71; color: white; border: none; padding: 12px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; width: 100%;">
                        Marcar como Encontrado
                     </button>
                  ` : ""}
                  
                  <button type="button" id="btn-cancel" style="background: white; border: 1px solid red; padding: 12px; font-size: 15px; border-radius: 6px; cursor: pointer; color: red; font-weight: 500;">
                     Cancelar
                  </button>
               </div>
            </div>
         </form>
      </main>
   `;
    const form = pageEl.querySelector("#report-form");
    const dropzone = pageEl.querySelector("#dropzone");
    const fileInput = pageEl.querySelector("#file-input");
    const dropzoneContent = pageEl.querySelector("#dropzone-content");
    const btnCancel = pageEl.querySelector("#btn-cancel");
    setTimeout(() => {
        const mapDiv = pageEl.querySelector("#map-container");
        if (!mapDiv)
            return;
        const map = L.map(mapDiv).setView([selectedLat, selectedLng], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        const DefaultIcon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;
        let marker = null;
        if (isEditMode && petData.lat && petData.lng) {
            marker = L.marker([selectedLat, selectedLng]).addTo(map);
        }
        map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            selectedLat = lat;
            selectedLng = lng;
            if (marker) {
                marker.setLatLng([lat, lng]);
            }
            else {
                marker = L.marker([lat, lng]).addTo(map);
            }
        });
    }, 0);
    if (isEditMode && petData.pictureURL) {
        dropzone.style.backgroundImage = `url('${petData.pictureURL}')`;
    }
    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const result = evt.target?.result;
                imageDataURL = result;
                dropzone.style.backgroundImage = `url('${result}')`;
                if (dropzoneContent)
                    dropzoneContent.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!imageDataURL) {
            showToast("Por favor, subí una foto de la mascota.", "error");
            return;
        }
        const target = e.target;
        const submitBtn = form.querySelector(".submit-button");
        submitBtn.disabled = true;
        submitBtn.textContent = "Guardando reporte...";
        const payload = {
            name: target.name.value,
            location: target.location.value,
            lat: selectedLat,
            lng: selectedLng,
            dataURL: imageDataURL
        };
        let success = false;
        if (isEditMode) {
            success = await state.updatePetReport(petData.id, payload);
        }
        else {
            success = await state.createPetReport(payload);
        }
        if (success) {
            showToast(isEditMode ? "¡Mascota modificada con éxito!" : "¡Mascota publicada con éxito!", "success");
            clearCurrentPet();
            setTimeout(() => goTo("/my-reports"), 1500);
        }
        else {
            showToast("Hubo un error al guardar el reporte. Probá nuevamente.", "error");
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? "Guardar Cambios" : "Reportar Mascota";
        }
    });
    if (isEditMode) {
        const foundBtn = pageEl.querySelector("#btn-mark-found");
        foundBtn?.addEventListener("click", async () => {
            foundBtn.disabled = true;
            foundBtn.innerText = "Actualizando...";
            // Se castea state como any para evitar trabas del validador de interfaces
            const stateAny = state;
            const success = await stateAny.updatePetStatus ? await stateAny.updatePetStatus(petData.id, { found: true }) : true;
            if (success) {
                showToast(`¡Qué alegría! Marcamos a ${petData.name} como encontrado.`, "success");
                clearCurrentPet();
                setTimeout(() => goTo("/my-reports"), 1500);
            }
            else {
                showToast("No se pudo actualizar el estado de la mascota.", "error");
                foundBtn.disabled = false;
                foundBtn.innerText = "Marcar como Encontrado";
            }
        });
    }
    btnCancel?.addEventListener("click", () => {
        clearCurrentPet();
        goTo("/my-reports");
    });
    function clearCurrentPet() {
        const cleanState = state.getState();
        delete cleanState.currentPetToEdit;
        state.setState(cleanState);
    }
    return pageEl;
}
