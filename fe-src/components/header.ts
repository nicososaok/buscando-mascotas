import { goTo } from "../router";
import { state } from "../state";

const huellaImg = new URL("../assets/img/huella.png", import.meta.url).href;
const menuImg = new URL("../assets/img/menu.png", import.meta.url).href;

export class CustomHeader extends HTMLElement {
   constructor() {
      super();
   }

   connectedCallback() {
      this.render();
   }

   render() {
      this.innerHTML = `
         <header class="header" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background-color: #26302E; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%; box-sizing: border-box; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            <div class="header__logo" style="display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 20px; cursor: pointer;">
               <img src="${huellaImg}" alt="Logo" style="width: 40px; height: 40px; object-fit: contain;">
            </div>
            <button class="header__menu-button" style="background: none; border: none; cursor: pointer; padding: 5px;">
               <img src="${menuImg}" alt="Menú" style="width: 30px; height: 30px; object-fit: contain;">
            </button>
         </header>
      `;

      const logo = this.querySelector(".header__logo");
      logo?.addEventListener("click", () => {
         console.log("Resetando estado y navegando a home...");
         const cs = state.getState();
         cs.petsAround = [];
         state.setState(cs);

         goTo("/");
      });

      const menuBtn = this.querySelector(".header__menu-button");
      menuBtn?.addEventListener("click", () => {
         this.dispatchEvent(new CustomEvent("toggle-menu", {
            bubbles: true,
            composed: true,
         }));
      });
   }
}

if (!customElements.get("custom-header")) {
   customElements.define("custom-header", CustomHeader);
}