import { goTo } from "../router";
import { state } from "../state";

function showToast(message: string, type: "success" | "error" = "success") {
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

export class CustomMenu extends HTMLElement {
   connectedCallback() {
      this.render();

      window.addEventListener("toggle-menu", () => {
         this.toggle();
      });
   }

   render() {
      const cs = state.getState();
      const isLogged = !!cs.token;

      this.innerHTML = `
         <div class="menu-overlay" style="
            position: fixed;
            top: 0;
            right: -100%;
            width: 100%;
            height: 100vh;
            background-color: #263238;
            box-shadow: -2px 0 10px rgba(0,0,0,0.2);
            z-index: 9999;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
            padding: 30px;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
         ">
            <button class="menu-close-btn" style="
               align-self: flex-end;
               background: none;
               border: none;
               font-size: 32px;
               cursor: pointer;
               padding: 5px;
               color: #ffffff;
            ">✕</button>
            
            <nav class="menu-nav" style="
               display: flex;
               flex-direction: column;
               gap: 30px;
               margin-top: 40px;
               font-size: 26px;
               font-weight: bold;
               text-align: center;
            ">
               ${!isLogged ? `
                  <a class="menu-link" data-route="/" style="text-decoration: none; color: #ffffff; cursor: pointer;">Inicio</a>
                  <a class="menu-link" data-route="/pets-nearby" style="text-decoration: none; color: #ffffff; cursor: pointer;">Mascotas cerca</a>
                  <a class="menu-link" data-route="/login" style="text-decoration: none; color: #ffffff; cursor: pointer; margin-top: 10px;">Iniciar Sesión</a>
               ` : `
                  <a class="menu-link" data-route="/" style="text-decoration: none; color: #ffffff; cursor: pointer;">Inicio</a>
                  <a class="menu-link" data-route="/profile" style="text-decoration: none; color: #ffffff; cursor: pointer;">Mis Datos</a>
                  <a class="menu-link" data-route="/pets-nearby" style="text-decoration: none; color: #ffffff; cursor: pointer;">Mascotas cerca</a>
                  <a class="menu-link" data-route="/my-reports" style="text-decoration: none; color: #ffffff; cursor: pointer;">Mascotas reportadas</a>
                  <a class="menu-link" data-route="/report" style="text-decoration: none; color: #ffffff; cursor: pointer;">Reportar Mascota</a>
                  
                  <button class="menu-logout-btn" style="
                     margin-top: 50px;
                     background-color: transparent;
                     color: #ff5252;
                     border: 2px solid #ff5252;
                     padding: 12px;
                     font-size: 18px;
                     font-weight: bold;
                     border-radius: 6px;
                     cursor: pointer;
                     width: 100%;
                  ">Cerrar Sesión</button>
               `}
            </nav>
         </div>
      `;

      const overlay = this.querySelector(".menu-overlay") as HTMLElement;
      const closeBtn = this.querySelector(".menu-close-btn");
      const links = this.querySelectorAll(".menu-link");
      const logoutBtn = this.querySelector(".menu-logout-btn");

      const closeMenu = () => {
         if (overlay) overlay.style.right = "-100%";
      };

      closeBtn?.addEventListener("click", closeMenu);

      links.forEach((link) => {
         link.addEventListener("click", (e) => {
            e.preventDefault();

            const targetRoute = (link as HTMLElement).dataset.route;
            if (targetRoute) {
               const currentState = state.getState();

               const strictPrivateRoutes = ["/profile", "/my-reports", "/report"];

               if (strictPrivateRoutes.includes(targetRoute) && !currentState.token) {
                  showToast("Necesitás iniciar sesión para acceder a esta sección.", "error");
                  setTimeout(() => {
                     closeMenu();
                     goTo("/login");
                  }, 1800);
                  return;
               }

               if (targetRoute === "/") {
                  currentState.petsAround = [];
                  state.setState(currentState);
               }

               if (targetRoute === "/report") {
                  delete currentState.currentPetToEdit;
                  state.setState(currentState);
               }

               closeMenu();
               this.render();
               goTo(targetRoute);
            }
         });
      });

      logoutBtn?.addEventListener("click", () => {
         state.logout();
         closeMenu();
         this.render();
         goTo("/");
      });
   }

   toggle() {
      const overlay = this.querySelector(".menu-overlay") as HTMLElement;
      if (overlay) {
         if (overlay.style.right === "0px") {
            overlay.style.right = "-100%";
         } else {
            overlay.style.right = "0px";
         }
      }
   }
}

if (!customElements.get("custom-menu")) {
   customElements.define("custom-menu", CustomMenu);
}