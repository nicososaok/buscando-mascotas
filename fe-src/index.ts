import { initRouter } from "./router";
import { state } from "./state";

import "./components/header";
import "./components/menu";
import "./components/pet-card";
import "./components/modal-avistaje";

async function main() {
   console.log("🐾 ¡App de Mascotas Perdidas iniciada con éxito!");

   const root = document.querySelector(".root") || document.getElementById("root");

   if (root) {
      initRouter(root as HTMLElement);
   } else {
      console.error("❌ Error crítico: No se encontró el elemento contenedor para iniciar el router.");
      return;
   }

   const currentState = state.getState();
   if (currentState.token) {
      console.log("🔑 Token encontrado, recuperando sesión de usuario en segundo plano...");
      state.fetchUserData().catch((err) => {
         console.error("❌ Error al recuperar los datos del usuario de forma silenciosa:", err);
      });
   }
}

main();