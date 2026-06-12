import { state } from "../state";
import { goTo } from "../router";

const signupImg = new URL("../assets/img/undraw_login.png", import.meta.url).href;

// --- IMPORTACIÓN DE ASSETS DEL OJITO ---
const openEyeImg = new URL("../assets/img/abrir-ojo.png", import.meta.url).href;
const closedEyeImg = new URL("../assets/img/cerrar-ojo.png", import.meta.url).href;
// -----------------------------------------

function showToast(message: string, type: "success" | "error" = "success") {
   // (El código del toast queda igual...)
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
   toast.innerText = (type === "success" ? "🎉 " : "❌ ") + message;

   document.body.appendChild(toast);
   setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3000);
}

export function initSignup() {
   const pageEl = document.createElement("div");
   pageEl.classList.add("page-signup");

   pageEl.innerHTML = `
      <custom-header></custom-header>
      <custom-menu></custom-menu>
      
      <main class="auth-container" style="max-width: 400px; margin: 0 auto; padding: 50px 20px; text-align: center; font-family: 'Inter', sans-serif; min-height: 80vh;">
         <img src="${signupImg}" class="auth-img" alt="Ilustración de registro" style="width: 100%; max-width: 180px; height: auto; margin-bottom: 25px;">
         
         <h1 class="auth-title" style="font-size: 32px; margin: 0 0 10px 0; font-weight: 800; color: #333;">Registrarse</h1>
         <p class="auth-description" style="color: #666; margin-bottom: 30px; font-size: 15px; line-height: 1.4;">Ingresá tus datos para crear una cuenta nueva y empezar a reportar.</p>
         
         <form class="auth-form" id="signup-form" style="display: flex; flex-direction: column; gap: 20px; text-align: left;">
            
            <div class="form-field" style="display: flex; flex-direction: column; gap: 8px;">
               <label class="form-label" style="font-weight: bold; font-size: 12px; color: #444; letter-spacing: 1px;">NOMBRE</label>
               <input type="text" name="name" class="form-input" placeholder="Tu nombre" required style="padding: 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; width: 100%; box-sizing: border-box;">
            </div>

            <div class="form-field" style="display: flex; flex-direction: column; gap: 8px;">
               <label class="form-label" style="font-weight: bold; font-size: 12px; color: #444; letter-spacing: 1px;">EMAIL</label>
               <input type="email" name="email" class="form-input" placeholder="tu-email@ejemplo.com" required style="padding: 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; width: 100%; box-sizing: border-box;">
            </div>

            <div class="form-field" style="display: flex; flex-direction: column; gap: 8px;">
               <label class="form-label" style="font-weight: bold; font-size: 12px; color: #444; letter-spacing: 1px;">CONTRASEÑA</label>
               
               <div style="position: relative; display: flex; align-items: center; width: 100%;">
                  <input type="password" name="password" id="password-input" class="form-input" placeholder="Mínimo 6 caracteres" minlength="6" required style="padding: 14px 45px 14px 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; width: 100%; box-sizing: border-box;">
                  <button type="button" id="toggle-password" style="position: absolute; right: 14px; background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center;">
                     <img id="toggle-password-img" src="${closedEyeImg}" alt="Mostrar/Ocultar" style="width: 20px; height: auto;">
                  </button>
               </div>
            </div>

            <button type="submit" class="submit-button" style="background-color: #5A8FEC; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.05); width: 100%; margin-top: 10px; transition: background 0.2s;">
               Crear cuenta
            </button>
            
            <p style="font-size: 14px; text-align: center; color: #666; margin-top: 18px;">
               ¿Ya tenés una cuenta? <a id="link-to-login" style="color: #FF6B6B; font-weight: bold; cursor: pointer; text-decoration: underline;">Iniciá sesión acá</a>
            </p>
         </form>
      </main>
   `;

   const form = pageEl.querySelector("#signup-form") as HTMLFormElement;
   const linkLogin = pageEl.querySelector("#link-to-login");

   // --- LÓGICA DE MOSTRAR / OCULTAR CON PNG ---
   const passwordInput = pageEl.querySelector("#password-input") as HTMLInputElement;
   const togglePasswordBtn = pageEl.querySelector("#toggle-password") as HTMLButtonElement;
   const togglePasswordImg = pageEl.querySelector("#toggle-password-img") as HTMLImageElement;

   togglePasswordBtn?.addEventListener("click", () => {
      if (passwordInput.type === "password") {
         passwordInput.type = "text";
         // Con el ojo abierto debe verse la contraseña (texto plano)
         togglePasswordImg.src = openEyeImg;
      } else {
         passwordInput.type = "password";
         // Con el ojo cerrado se debe ocultar la contraseña (puntitos)
         togglePasswordImg.src = closedEyeImg;
      }
   });
   // ----------------------------------------------

   linkLogin?.addEventListener("click", () => {
      goTo("/login");
   });

   form?.addEventListener("submit", async (e) => {
      // (submit event handler...)
      e.preventDefault();

      const target = e.target as any;
      const name = target.name.value;
      const email = target.email.value;
      const password = target.password.value;

      const submitButton = form.querySelector(".submit-button") as HTMLButtonElement;
      submitButton.disabled = true;
      submitButton.textContent = "⌛ Creando cuenta...";

      const signupResult = await state.signUp({ name, email, password });

      if (signupResult.success) {
         showToast("¡Cuenta creada con éxito! Iniciando sesión...", "success");

         setTimeout(() => {
            goTo("/profile");
         }, 1500);

      } else {
         const errorMsg = signupResult.error || "Hubo un problema. Quizás el email ya esté en uso.";
         showToast(errorMsg, "error");

         submitButton.disabled = false;
         submitButton.textContent = "Crear cuenta";
      }
   });

   return pageEl;
}