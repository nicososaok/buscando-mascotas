import { state } from "../state";
import { goTo } from "../router";

export function initInfoPage() {
   const pageEl = document.createElement("div");
   pageEl.classList.add("page-info");

   pageEl.innerHTML = `
      <custom-header></custom-header>
      <custom-menu></custom-menu>
      
      <main class="info-container" style="max-width: 550px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif; min-height: 80vh; text-align: center;">
         <h1 style="font-size: 32px; font-weight: 800; color: #333; margin-bottom: 10px;">¿Cómo funciona?</h1>
         <p style="color: #666; font-size: 16px; margin-bottom: 40px; line-height: 1.6;">Pet Finder te ayuda a conectar con personas cerca tuyo para encontrar mascotas perdidas de forma rápida y comunitaria.</p>
         
         <div style="display: flex; flex-direction: column; gap: 30px; text-align: left; margin-bottom: 40px;">
            
            <div style="display: flex; gap: 20px; align-items: flex-start;">
               <div style="background-color: #26302E; color: white; font-weight: 800; font-size: 20px; min-width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">1</div>
               <div>
                  <h3 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 700; color: #333;">Compartí tu ubicación</h3>
                  <p style="margin: 0; color: #666; line-height: 1.5;">Al dar permisos de GPS, el sistema busca de forma automática los reportes activos en un radio cercano a donde te encontrás.</p>
               </div>
            </div>

            <div style="display: flex; gap: 20px; align-items: flex-start;">
               <div style="background-color: #26302E; color: white; font-weight: 800; font-size: 20px; min-width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">2</div>
               <div>
                  <h3 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 700; color: #333;">Reportá avistajes</h3>
                  <p style="margin: 0; color: #666; line-height: 1.5;">Si ves a una de las mascotas de la grilla en la calle, podés enviar un formulario rápido con el lugar exacto y tus datos de contacto.</p>
               </div>
            </div>

            <div style="display: flex; gap: 20px; align-items: flex-start;">
               <div style="background-color: #26302E; color: white; font-weight: 800; font-size: 20px; min-width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">3</div>
               <div>
                  <h3 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 700; color: #333;">Notificaciones al instante</h3>
                  <p style="margin: 0; color: #666; line-height: 1.5;">El dueño de la mascota recibirá un correo electrónico automatizado en tiempo real con la información que aportaste para poder ir a buscarla.</p>
               </div>
            </div>

         </div>

         <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px;">
            <button id="btn-share-location" style="background-color: #5A8FEC; color: white; border: none; padding: 16px 28px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.08); width: 100%; max-width: 280px; transition: background-color 0.2s;">
               Dar mi ubicación actual
            </button>

            <button id="btn-lost-pet" style="background-color: #EB6372; color: white; border: none; padding: 16px 28px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.08); width: 100%; max-width: 280px; transition: background-color 0.2s;">
               Perdí a mi mascota
            </button>
         </div>
      </main>
   `;

   const btnShareLocation = pageEl.querySelector("#btn-share-location") as HTMLButtonElement;
   const btnLostPet = pageEl.querySelector("#btn-lost-pet");

   btnShareLocation?.addEventListener("click", () => {
      btnShareLocation.disabled = true;
      btnShareLocation.textContent = "Buscando mascotas...";

      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            async (position) => {
               try {
                  const { latitude, longitude } = position.coords;

                  const currentState = state.getState();
                  state.setState({
                     ...currentState,
                     lat: latitude,
                     lng: longitude
                  });

                  await state.fetchPetsAround(latitude, longitude);
                  goTo("/pets-nearby");
               } catch (error) {
                  console.error("Error al procesar la información de ubicación:", error);
                  alert("Hubo un error al sincronizar las mascotas de tu zona.");
                  btnShareLocation.disabled = false;
                  btnShareLocation.textContent = "Dar mi ubicación actual";
               }
            },
            (error) => {
               console.error("Error obteniendo ubicación en info", error);
               alert("No se pudo obtener tu ubicación. Asegurate de habilitar los permisos de GPS.");
               btnShareLocation.disabled = false;
               btnShareLocation.textContent = "Dar mi ubicación actual";
            },
            {
               enableHighAccuracy: true,
               timeout: 5000,
               maximumAge: 0
            }
         );
      } else {
         alert("Tu navegador no soporta geolocalización nativa.");
         btnShareLocation.disabled = false;
         btnShareLocation.textContent = "Dar mi ubicación actual";
      }
   });

   btnLostPet?.addEventListener("click", () => {
      goTo("/report");
   });

   return pageEl;
}