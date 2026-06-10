import { state } from "../state";
import { goTo } from "../router";
function showToast(message, type = "success") {
    console.log("Intentando mostrar toast:", message);
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
    toast.style.zIndex = "999999";
    toast.style.transition = "opacity 0.3s ease";
    toast.innerText = (type === "success" ? "✅ " : "❌ ") + message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3000);
}
export function initPetsNearbyPage() {
    const pageEl = document.createElement("div");
    pageEl.classList.add("page-pets-nearby");
    pageEl.innerHTML = `
      <custom-header></custom-header>
      <custom-menu></custom-menu>
      
      <main class="nearby-container" style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif; min-height: 80vh;">
         <h1 style="font-size: 32px; font-weight: 800; color: #333; margin-bottom: 30px; text-align: center;">Mascotas perdidas cerca</h1>
         
         <div id="pets-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; justify-items: center; width: 100%;">
            <p style="text-align: center; color: #666;">Buscando mascotas cerca de tu ubicación...</p>
         </div>
      </main>

      <div id="modal-avistaje-container" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;">
         <div style="background: white; width: 100%; max-width: 500px; border-radius: 4px; padding: 35px; position: relative; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.15); font-family: 'Inter', sans-serif; box-sizing: border-box;">
            <button id="close-modal-btn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #9E9E9E; font-weight: 300;">✕</button>
            <h2 id="modal-title" style="margin: 0 0 12px; font-size: 32px; font-weight: 700; color: #333333; line-height: 1.2;">Reportar avistaje</h2>
            <p style="margin: 0 0 25px; font-size: 16px; color: #616161; line-height: 1.4;">Dejá los datos del avistaje de esta mascota para que el dueño sea notificado.</p>
            
            <form id="form-avistaje" style="display: flex; flex-direction: column; gap: 20px;">
               <label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700; color: #4A4A4A;">
                  TU NOMBRE
                  <input type="text" name="reporter_name" required style="padding: 12px; border: 1px solid #CCCCCC; border-radius: 4px; font-size: 16px; font-family: 'Inter', sans-serif; color: #333333; box-sizing: border-box; width: 100%;">
               </label>
               <label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700; color: #4A4A4A;">
                  TU TELÉFONO
                  <input type="tel" name="reporter_phone" required style="padding: 12px; border: 1px solid #CCCCCC; border-radius: 4px; font-size: 16px; font-family: 'Inter', sans-serif; color: #333333; box-sizing: border-box; width: 100%;">
               </label>
               <label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700; color: #4A4A4A;">
                  ¿DÓNDE LO VISTE?
                  <textarea name="reporter_info" placeholder="Ej: Cerca de la plaza principal a las 14:00..." required rows="4" style="padding: 12px; border: 1px solid #CCCCCC; border-radius: 4px; font-size: 16px; font-family: 'Inter', sans-serif; color: #333333; resize: none; box-sizing: border-box; width: 100%;"></textarea>
               </label>
               <button type="submit" style="background-color: #FF6B6B; color: white; border: none; padding: 15px; font-size: 18px; font-weight: 700; border-radius: 4px; cursor: pointer; text-align: center; margin-top: 10px; transition: background 0.2s;">Enviar Información</button>
            </form>
         </div>
      </div>
   `;
    const grid = pageEl.querySelector("#pets-grid");
    const modalContainer = pageEl.querySelector("#modal-avistaje-container");
    const modalTitle = pageEl.querySelector("#modal-title");
    const formAvistaje = pageEl.querySelector("#form-avistaje");
    let currentPetIdForAvistaje = null;
    function renderPets(pets) {
        if (!pets || pets.length === 0) {
            grid.innerHTML = `<p style="text-align: center; color: #666; padding: 20px;">No hay mascotas reportadas cerca por ahora.</p>`;
            return;
        }
        grid.innerHTML = "";
        pets.forEach((pet) => {
            const card = document.createElement("pet-card-comp");
            card.setAttribute("type", "home");
            card.petData = pet;
            grid.appendChild(card);
        });
    }
    grid.addEventListener("report-avistaje", (e) => {
        const cs = state.getState();
        if (!cs.token) {
            showToast("Necesitás iniciar sesión para poder reportar.", "error");
            setTimeout(() => {
                goTo("/login");
            }, 1800);
            return;
        }
        const { petId, petName } = e.detail;
        currentPetIdForAvistaje = petId;
        modalTitle.textContent = `Reportar avistaje de ${petName}`;
        modalContainer.style.display = "flex";
    });
    pageEl.querySelector("#close-modal-btn")?.addEventListener("click", () => modalContainer.style.display = "none");
    formAvistaje.addEventListener("submit", async (e) => {
        e.preventDefault();
        const target = e.target;
        const success = await state.sendPetAvistaje({
            petId: currentPetIdForAvistaje,
            reporterName: target.reporter_name.value,
            reporterPhone: target.reporter_phone.value,
            locationDescription: target.reporter_info.value
        });
        if (success) {
            showToast("¡Gracias por tu colaboración! El dueño será notificado de inmediato.", "success");
            modalContainer.style.display = "none";
            formAvistaje.reset();
        }
    });
    async function initLoad() {
        const currentPets = state.getState().petsAround;
        if (currentPets && currentPets.length > 0) {
            renderPets(currentPets);
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                if (!document.contains(pageEl))
                    return;
                const { latitude, longitude } = position.coords;
                await state.fetchPetsAround(latitude, longitude);
                if (document.contains(pageEl)) {
                    renderPets(state.getState().petsAround);
                }
            }, (err) => {
                console.error("Error de geolocalización:", err);
                if (document.contains(pageEl)) {
                    grid.innerHTML = `<p style="text-align: center; color: #666; padding: 20px;">Necesitamos tu ubicación para mostrarte las mascotas perdidas que están cerca tuyo.</p>`;
                }
            });
        }
    }
    initLoad();
    return pageEl;
}
