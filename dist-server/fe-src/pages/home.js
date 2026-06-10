import { state } from "../state";
import { goTo } from "../router";
const beachImg = new URL("../assets/img/undraw_beach_day_cser.png", import.meta.url).href;
export function initHome() {
    console.log("¡ENTRÓ A LA FUNCIÓN DEL HOME!");
    const pageEl = document.createElement("div");
    pageEl.classList.add("page-home");
    const cleanState = state.getState();
    if (cleanState.currentPetToEdit) {
        delete cleanState.currentPetToEdit;
    }
    pageEl.innerHTML = `
      <custom-header></custom-header>
      <custom-menu></custom-menu>
      
      <main class="home-container" style="max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; font-family: 'Inter', sans-serif; min-height: 80vh;">
         <section id="welcome-section" style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin-top: 50px;">
            <img src="${beachImg}" class="welcome-illustration" alt="Pet Finder" style="width: 100%; max-width: 280px; height: auto;">
            <h1 class="welcome-title" style="margin: 0; font-weight: 800; color: #EB6372;">Pet Finder App</h1>
            <p class="welcome-subtitle" style="color: #666; max-width: 440px; margin: 0; line-height: 1.5;">Encontrá y reportá mascotas perdidas cerca de tu ubicación.</p>
            
            <button class="btn-primary" id="btn-location" style="background-color: #5A8FEC; color: white; border: none; padding: 16px 28px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.08); width: 100%; max-width: 280px; margin-top: 15px; transition: background-color 0.2s;">
               Dar mi ubicación actual
            </button>

            <button id="btn-how-it-works" style="background: none; border: 1px solid #666; color: #333; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; width: 100%; max-width: 280px; margin-top: 5px; transition: background 0.2s;">
               ¿Cómo funciona Pet Finder?
            </button>
         </section>
      </main>
   `;
    const btnLocation = pageEl.querySelector("#btn-location");
    const btnHowItWorks = pageEl.querySelector("#btn-how-it-works");
    btnLocation?.addEventListener("click", () => {
        btnLocation.disabled = true;
        btnLocation.textContent = "Buscando mascotas...";
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                await state.fetchPetsAround(latitude, longitude);
                goTo("/pets-nearby");
            }, (error) => {
                console.error("Error obteniendo ubicación", error);
                alert("No se pudo obtener tu ubicación. Asegurate de habilitar los permisos de GPS.");
                btnLocation.disabled = false;
                btnLocation.textContent = "Dar mi ubicación actual";
            });
        }
        else {
            alert("Tu navegador no soporta geolocalización nativa.");
            btnLocation.disabled = false;
            btnLocation.textContent = "Dar mi ubicación actual";
        }
    });
    btnHowItWorks?.addEventListener("click", () => {
        goTo("/info");
    });
    return pageEl;
}
