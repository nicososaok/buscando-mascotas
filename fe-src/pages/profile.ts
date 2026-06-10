import { state } from "../state";
import { goTo } from "../router";

export function initProfile() {
   const pageEl = document.createElement("div");
   pageEl.classList.add("page-profile");

   const cs = state.getState();
   if (!cs.token) {
      setTimeout(() => goTo("/login"), 0);
      return pageEl;
   }

   pageEl.innerHTML = `
      <custom-header></custom-header>
      <custom-menu></custom-menu>
      
      <main class="profile-container" style="max-width: 400px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif; min-height: 80vh;">
         <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #333; text-align: center;">Mis datos</h1>
         <p style="color: #666; text-align: center; margin-bottom: 30px;">Modificá tu información personal de contacto.</p>
         
         <form id="profile-data-form" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-field" style="display: flex; flex-direction: column; gap: 6px;">
               <label style="font-weight: bold; font-size: 12px; color: #666; letter-spacing: 0.5px;">NOMBRE COMPLETO</label>
               <input type="text" name="name" id="user-name-input" value="${cs.userName || ""}" required style="padding: 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; width: 100%;">
            </div>
            
            <button type="submit" class="btn-submit-name" style="background-color: #5A8FEC; color: white; border: none; padding: 14px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: background 0.2s; width: 100%;">
               Guardar Nombre
            </button>
         </form>

         <button id="btn-go-password" style="margin-top: 25px; background-color: transparent; color: #5A8FEC; border: 1px solid #5A8FEC; padding: 12px; font-size: 15px; font-weight: bold; border-radius: 6px; cursor: pointer; width: 100%;">
            Cambiar Contraseña
         </button>
      </main>
   `;

   const dataForm = pageEl.querySelector("#profile-data-form") as HTMLFormElement;
   const goPasswordBtn = pageEl.querySelector("#btn-go-password");

   goPasswordBtn?.addEventListener("click", () => {
      goTo("/profile/password");
   });

   dataForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputName = (pageEl.querySelector("#user-name-input") as HTMLInputElement).value;
      const submitBtn = dataForm.querySelector(".btn-submit-name") as HTMLButtonElement;

      submitBtn.disabled = true;
      submitBtn.textContent = "Guardando...";

      const success = await state.updateProfileName(inputName);
      if (success) {
         alert("¡Nombre actualizado correctamente!");
      } else {
         alert("Hubo un error al actualizar el nombre.");
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar Nombre";
   });

   return pageEl;
}