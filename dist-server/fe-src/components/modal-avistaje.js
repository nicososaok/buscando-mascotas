import { state } from "../state";
export class ModalAvistaje extends HTMLElement {
    currentPetId = null;
    connectedCallback() {
        this.render();
    }
    open(petId, petName) {
        this.currentPetId = petId;
        const overlay = this.querySelector(".modal-overlay");
        const title = this.querySelector(".modal-title");
        if (title)
            title.textContent = `Reportar avistaje de ${petName}`;
        if (overlay)
            overlay.style.display = "flex";
    }
    close() {
        const overlay = this.querySelector(".modal-overlay");
        const form = this.querySelector(".form-avistaje");
        if (overlay)
            overlay.style.display = "none";
        if (form)
            form.reset();
    }
    render() {
        this.innerHTML = `
         <div class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;">
            <div style="background: white; width: 100%; max-width: 500px; border-radius: 4px; padding: 35px; position: relative; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.15); font-family: 'Inter', sans-serif; box-sizing: border-box;">
               
               <button class="close-modal-btn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #9E9E9E; font-weight: 300;">✕</button>
               
               <h2 class="modal-title" style="margin: 0 0 12px; font-size: 32px; font-weight: 700; color: #333333; font-family: serif; line-height: 1.2;">Reportar avistaje</h2>
               
               <p style="margin: 0 0 25px; font-size: 16px; color: #616161; line-height: 1.4;">Dejá los datos del avistaje de esta mascota para que el dueño sea notificado.</p>
               
               <form class="form-avistaje" style="display: flex; flex-direction: column; gap: 20px;">
                  
                  <label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700; color: #4A4A4A;">
                     TU NOMBRE
                     <input type="text" name="reporter_name" required style="padding: 12px; border: 1px solid #CCCCCC; border-radius: 4px; font-size: 16px; font-family: 'Inter', sans-serif; color: #333333; box-sizing: border-box; width: 100%;">
                  </label>
                  
                  <label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700; color: #4A4A4A;">
                     TU TELÉFONO
                     <input type="tel" name="reporter_phone" placeholder="Ej: 1122334455" required style="padding: 12px; border: 1px solid #CCCCCC; border-radius: 4px; font-size: 16px; font-family: 'Inter', sans-serif; color: #333333; box-sizing: border-box; width: 100%;">
                  </label>
                  
                  <label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700; color: #4A4A4A;">
                     ¿DÓNDLE LO VISTE?
                     <textarea name="reporter_info" placeholder="Ej: Cerca de la plaza principal a las 14:00..." required rows="4" style="padding: 12px; border: 1px solid #CCCCCC; border-radius: 4px; font-size: 16px; font-family: 'Inter', sans-serif; color: #333333; resize: none; box-sizing: border-box; width: 100%;"></textarea>
                  </label>
                  
                  <button type="submit" style="background-color: #FF6B6B; color: white; border: none; padding: 15px; font-size: 18px; font-weight: 700; border-radius: 4px; cursor: pointer; text-align: center; margin-top: 10px; transition: background 0.2s;">Enviar Información</button>
               </form>
            </div>
         </div>
      `;
        this.setupListeners();
    }
    setupListeners() {
        const closeBtn = this.querySelector(".close-modal-btn");
        const form = this.querySelector(".form-avistaje");
        closeBtn?.addEventListener("click", () => this.close());
        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const target = e.target;
            const success = await state.sendPetAvistaje({
                petId: this.currentPetId,
                reporterName: target.reporter_name.value,
                reporterPhone: target.reporter_phone.value,
                locationDescription: target.reporter_info.value
            });
            if (success) {
                alert("¡Gracias por tu colaboración! El dueño será notificado de inmediato.");
                this.close();
            }
        });
    }
}
if (!customElements.get("modal-avistaje-comp")) {
    customElements.define("modal-avistaje-comp", ModalAvistaje);
}
