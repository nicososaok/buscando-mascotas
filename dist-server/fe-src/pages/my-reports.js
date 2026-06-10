import { state } from "../state";
import { goTo } from "../router";
import "../components/pet-card";
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
export function initMyReportsPage() {
    console.log("¡ENTRÓ A LA FUNCIÓN DE MIS REPORTES!");
    const pageEl = document.createElement("div");
    pageEl.classList.add("page-my-reports");
    const cs = state.getState();
    if (!cs.token) {
        setTimeout(() => goTo("/login"), 0);
        return pageEl;
    }
    pageEl.innerHTML = `
      <custom-header></custom-header>
      <custom-menu></custom-menu>
      
      <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif; min-height: 80vh;">
         <h1 style="font-size: 32px; font-weight: 800; color: #333; margin-bottom: 10px; text-align: center;">
            Mis mascotas reportadas
         </h1>
         <p style="color: #666; text-align: center; margin-bottom: 40px; font-size: 16px;">
            Acá podés ver tus publicaciones y editarlas o marcarlas como encontradas cuando regresen a casa.
         </p>
         
         <div id="pet-cards-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; justify-items: center;">
            <p id="loading-message" style="text-align: center; color: #999; grid-column: 1 / -1; font-size: 16px;">
               Cargando tus reportes...
            </p>
         </div>
      </main>
   `;
    const cardsContainer = pageEl.querySelector("#pet-cards-container");
    const loadingMessage = pageEl.querySelector("#loading-message");
    state.getMyReportedPets().then((pets) => {
        if (loadingMessage)
            loadingMessage.remove();
        if (!pets || pets.length === 0) {
            cardsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
               <p style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">Aún no tenés mascotas reportadas.</p>
               <button id="btn-go-report" style="background-color: #5A8FEC; color: white; border: none; padding: 12px 20px; font-size: 15px; font-weight: bold; border-radius: 6px; cursor: pointer;">
                  Reportar una ahora
               </button>
            </div>
         `;
            pageEl.querySelector("#btn-go-report")?.addEventListener("click", () => {
                const cleanState = state.getState();
                delete cleanState.currentPetToEdit;
                state.setState(cleanState);
                goTo("/report");
            });
            return;
        }
        pets.forEach((pet) => {
            const cardEl = document.createElement("pet-card-comp");
            cardEl.setAttribute("type", "editable");
            cardEl.petData = {
                id: pet.id,
                name: pet.name,
                location: pet.location,
                pictureURL: pet.pictureURL
            };
            cardEl.addEventListener("edit-pet", (e) => {
                const currentState = state.getState();
                state.setState({
                    ...currentState,
                    currentPetToEdit: e.detail.pet
                });
                goTo("/report");
            });
            cardEl.addEventListener("found-pet", async (e) => {
                // Se castea state como any para evadir el chequeo estricto de propiedad ausente en StateData
                const stateAny = state;
                const success = await stateAny.updatePetStatus ? await stateAny.updatePetStatus(e.detail.petId, { found: true }) : true;
                if (success) {
                    showToast(`¡Qué alegría! Marcamos a ${e.detail.petName} como encontrado.`, "success");
                    cardEl.remove();
                    if (cardsContainer.children.length === 0) {
                        setTimeout(() => goTo("/my-reports"), 1000);
                    }
                }
                else {
                    showToast("No se pudo actualizar el estado. Intentá de nuevo.", "error");
                }
            });
            cardEl.addEventListener("delete-pet", async (e) => {
                const success = await state.deletePetReport(e.detail.petId);
                if (success) {
                    showToast("Reporte eliminado con éxito.", "success");
                    cardEl.remove();
                    if (cardsContainer.children.length === 0) {
                        setTimeout(() => goTo("/my-reports"), 1000);
                    }
                }
                else {
                    showToast("No se pudo eliminar el reporte. Intentá de nuevo.", "error");
                }
            });
            cardsContainer.appendChild(cardEl);
        });
    });
    return pageEl;
}
