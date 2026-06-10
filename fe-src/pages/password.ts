import { state } from "../state";
import { goTo } from "../router";

export function initPasswordPage() {
   const pageEl = document.createElement("div");
   pageEl.classList.add("page-profile-password");

   const cs = state.getState();
   if (!cs.token) {
      setTimeout(() => goTo("/login"), 0);
      return pageEl;
   }

   pageEl.innerHTML = `
      <custom-header></custom-header>
      <custom-menu></custom-menu>
      
      <main class="password-container" style="max-width: 400px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif; min-height: 80vh;">
         <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #333; text-align: center;">Contraseña</h1>
         <p style="color: #666; text-align: center; margin-bottom: 30px;">Actualizá tus credenciales de acceso de forma segura.</p>

         <form id="profile-password-form" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-field" style="display: flex; flex-direction: column; gap: 6px;">
               <label style="font-weight: bold; font-size: 12px; color: #666; letter-spacing: 0.5px;">CONTRASEÑA ACTUAL</label>
               <input type="password" name="password" required style="padding: 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; width: 100%;">
            </div>

            <div class="form-field" style="display: flex; flex-direction: column; gap: 6px;">
               <label style="font-weight: bold; font-size: 12px; color: #666; letter-spacing: 0.5px;">NUEVA CONTRASEÑA</label>
               <input type="password" name="newPassword" minlength="6" required style="padding: 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; width: 100%;">
            </div>

            <div class="form-field" style="display: flex; flex-direction: column; gap: 6px;">
               <label style="font-weight: bold; font-size: 12px; color: #666; letter-spacing: 0.5px;">REPETIR NUEVA CONTRASEÑA</label>
               <input type="password" name="confirmPassword" minlength="6" required style="padding: 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; width: 100%;">
            </div>

            <button type="submit" class="btn-submit-password" style="background-color: #FF6B6B; color: white; border: none; padding: 14px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: background 0.2s; width: 100%;">
               Cambiar Clave
            </button>
         </form>
         
         <button id="btn-back-profile" style="margin-top: 15px; background: none; border: none; color: #666; cursor: pointer; text-decoration: underline; width: 100%;">
            Volver a mis datos
         </button>
      </main>
   `;

   const passwordForm = pageEl.querySelector("#profile-password-form") as HTMLFormElement;
   const backBtn = pageEl.querySelector("#btn-back-profile");

   backBtn?.addEventListener("click", () => goTo("/profile"));

   passwordForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const target = e.target as any;
      const password = target.password.value;
      const newPassword = target.newPassword.value;
      const confirmPassword = target.confirmPassword.value;
      const submitBtn = passwordForm.querySelector(".btn-submit-password") as HTMLButtonElement;

      if (newPassword !== confirmPassword) {
         alert("La nueva contraseña y su confirmación no coinciden.");
         return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Modificando...";

      const res = await state.updateProfilePassword({ password, newPassword });
      if (res && !res.error) {
         alert("¡Contraseña cambiada con éxito!");
         passwordForm.reset();
         goTo("/profile");
      } else {
         alert(res?.error || "Error al cambiar la clave. Verificá tu contraseña actual.");
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "Cambiar Clave";
   });

   return pageEl;
}