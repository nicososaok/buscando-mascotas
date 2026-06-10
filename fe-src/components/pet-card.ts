interface PetData {
   id: number;
   name: string;
   location: string;
   pictureURL: string;
   userId?: number;
}

export class PetCard extends HTMLElement {
   private _data!: PetData;

   static get observedAttributes() {
      return ["type"];
   }

   attributeChangedCallback() {
      this.render();
   }

   set petData(data: PetData) {
      this._data = data;
      this.render();
   }

   connectedCallback() {
      this.render();
   }

   render() {
      if (!this._data) return;

      const { id, name, location, pictureURL } = this._data;
      const fallbackImage = "https://placehold.co/300x200?text=Sin+Foto";
      const type = this.getAttribute("type") || "default";

      this.innerHTML = `
      <style>
         .pet-card {
            background: #FFFFFF;
            border: 1px solid #E5E5E5;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            font-family: 'Inter', sans-serif;
            width: 300px;
            max-width: 320px;
            height: 280px;
            display: flex;
            flex-direction: column;
            margin: 0 auto;
            box-sizing: border-box;
            position: relative; /* 📌 Necesario para posicionar el cartel encima */
         }
         .pet-card:hover {
            transform: translateY(-4px);
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
         }
         .pet-card__img-container {
            width: 100%;
            height: 160px;
            background-color: #f0f0f0;
            flex-shrink: 0;
         }
         .pet-card__img {
            width: 100%;
            height: 160px;
            object-fit: cover;
            display: block;
         }
         .pet-card__info {
            background-color: #26302E;
            padding: 12px 15px;
            height: 120px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
         }
         .pet-card__texts {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            width: 100%;
         }
         .pet-card__title {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: white;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
         }
         .pet-card__location {
            margin: 2px 0 0;
            color: white;
            font-size: 14px;
            text-transform: capitalize;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
         }
         .pet-card__buttons-container {
            display: flex;
            gap: 8px;
            width: 100%;
            margin-top: auto;
         }
         .pet-card__button {
            color: white;
            border: none;
            padding: 8px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            white-space: nowrap;
            flex: 1;
            text-align: center;
            font-size: 13px;
            transition: background 0.2s;
         }
         
         .pet-card__button--edit {
            background: #5A8FEC;
            display: ${type === "home" ? "none" : "block"};
         }
         .pet-card__button--report-or-delete {
            background: #FF6B6B;
         }

         .pet-card__button--edit:hover { background: #4676cc; }
         .pet-card__button--report-or-delete:hover { background: #e55b5b; }

         /* 🛑 ESTILOS DEL CARTEL DE CONFIRMACIÓN (FIGMA STYLE) */
         .pet-card__confirm-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(38, 48, 46, 0.95);
            display: none; /* Oculto por defecto */
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
            z-index: 10;
            transition: opacity 0.3s;
         }
         .pet-card__confirm-overlay.active {
            display: flex;
         }
         .pet-card__confirm-title {
            color: white;
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 15px 0;
         }
         .pet-card__confirm-buttons {
            display: flex;
            gap: 10px;
            width: 100%;
         }
         .btn-confirm-action {
            padding: 10px;
            border-radius: 4px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            flex: 1;
            font-size: 13px;
         }
         .btn-confirm-action--yes {
            background: #FF6B6B;
            color: white;
         }
         .btn-confirm-action--no {
            background: #ECECEC;
            color: #333;
         }
      </style>

      <div class="pet-card">
         <div class="pet-card__confirm-overlay">
            <p class="pet-card__confirm-title">¿Estás seguro de que querés eliminar el reporte de ${name}?</p>
            <div class="pet-card__confirm-buttons">
               <button class="btn-confirm-action btn-confirm-action--yes">Sí, eliminar</button>
               <button class="btn-confirm-action btn-confirm-action--no">Cancelar</button>
            </div>
         </div>

         <div class="pet-card__img-container">
            <img src="${pictureURL || fallbackImage}" alt="Foto de ${name}" class="pet-card__img" onerror="this.src='${fallbackImage}'" />
         </div>
         <div class="pet-card__info">
            <div class="pet-card__texts">
               <h2 class="pet-card__title">${name || "Mascota"}</h2>
               <p class="pet-card__location">${location || "Ubicación desconocida"}</p>
            </div>
            <div class="pet-card__buttons-container">
               <button class="pet-card__button pet-card__button--edit">Editar</button>
               <button class="pet-card__button pet-card__button--report-or-delete">
                  ${type === "editable" ? "Eliminar" : "Reportar avistaje"}
               </button>
            </div>
         </div>
      </div>
   `;

      const overlay = this.querySelector(".pet-card__confirm-overlay") as HTMLElement;

      this.querySelector(".pet-card__button--edit")?.addEventListener("click", () => {
         this.dispatchEvent(new CustomEvent("edit-pet", {
            detail: { petId: id, pet: this._data },
            bubbles: true,
            composed: true
         }));
      });

      this.querySelector(".pet-card__button--report-or-delete")?.addEventListener("click", () => {
         if (type === "editable") {
            overlay.classList.add("active");
         } else {
            this.dispatchEvent(new CustomEvent("report-avistaje", {
               detail: { petId: id, petName: name },
               bubbles: true,
               composed: true
            }));
         }
      });

      this.querySelector(".btn-confirm-action--no")?.addEventListener("click", () => {
         overlay.classList.remove("active");
      });

      this.querySelector(".btn-confirm-action--yes")?.addEventListener("click", () => {
         overlay.classList.remove("active");
         this.dispatchEvent(new CustomEvent("delete-pet", {
            detail: { petId: id, petName: name },
            bubbles: true,
            composed: true
         }));
      });
   }
}

if (!customElements.get("pet-card-comp")) {
   customElements.define("pet-card-comp", PetCard);
}