const API_BASE_URL = process.env.API_BASE_URL || "";

interface StateData {
   userId: number | null;
   userName: string;
   userEmail: string;
   token: string;
   currentRoute: string;
   petsAround: any[];
   myReportedPets: any[];
   currentPetToEdit?: any;
}

const state = {
   data: {
      userId: null,
      userName: "",
      userEmail: "",
      token: localStorage.getItem("auth_token") || "",
      currentRoute: "/",
      petsAround: [],
      myReportedPets: [],
   } as StateData,

   listeners: [] as ((data: StateData) => any)[],

   getState() {
      return this.data;
   },

   setState(newState: StateData) {
      this.data = newState;
      for (const cb of this.listeners) {
         cb(this.data);
      }
      console.log("🔄 El estado ha cambiado:", this.data);
   },

   subscribe(callback: (data: StateData) => any) {
      this.listeners.push(callback);
   },

   /* MÉTODOS DE AUTENTICACIÓN */

   async signUp(userData: { name: string; email: string; password: string }) {
      try {
         const res = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
         });
         const json = await res.json();

         if (res.ok && json.token) {
            const cs = this.getState();
            cs.token = json.token;
            cs.userName = userData.name;
            cs.userEmail = userData.email;
            localStorage.setItem("auth_token", json.token);
            this.setState(cs);
            return { success: true };
         }
         return { success: false, error: json.error };
      } catch (error) {
         return { success: false, error };
      }
   },

   async signIn(email: string, password: string) {
      try {
         const res = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
         });

         const json = await res.json();

         if (json.token) {
            const cs = this.getState();
            cs.token = json.token;
            localStorage.setItem("auth_token", json.token);
            this.setState(cs);
            return { success: true };
         }
         return { success: false, error: json.error };
      } catch (error) {
         return { success: false, error };
      }
   },

   logout() {
      localStorage.removeItem("auth_token");
      this.setState({
         userId: null,
         userName: "",
         userEmail: "",
         token: "",
         currentRoute: "/",
         petsAround: [],
         myReportedPets: [],
      });
   },

   /* MÉTODOS DE USUARIO */

   async fetchUserData() {
      const cs = this.getState();
      if (!cs.token) return;

      try {
         const res = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${cs.token}` },
         });
         const json = await res.json();

         cs.userId = json.id;
         cs.userName = json.name;
         cs.userEmail = json.email;
         this.setState(cs);
      } catch (error) {
         console.error("Error al traer data de usuario", error);
      }
   },

   async updateProfileName(name: string): Promise<boolean> {
      const cs = this.getState();
      try {
         const res = await fetch(`${API_BASE_URL}/user/profile`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${cs.token}`,
            },
            body: JSON.stringify({ name }),
         });

         if (res.ok) {
            cs.userName = name;
            this.setState(cs);
            return true;
         }
         return false;
      } catch (error) {
         console.error(error);
         return false;
      }
   },

   async updateProfilePassword(credentials: { password: string; newPassword: string }) {
      const cs = this.getState();
      try {
         const res = await fetch(`${API_BASE_URL}/user/password`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${cs.token}`,
            },
            body: JSON.stringify(credentials),
         });
         return await res.json();
      } catch (error) {
         console.error(error);
         return { error: "No se pudo procesar la solicitud de cambio." };
      }
   },

   /* MÉTODOS DE MASCOTAS */

   async fetchPetsAround(lat: number, lng: number) {
      try {
         const res = await fetch(`${API_BASE_URL}/pets/around?lat=${lat}&lng=${lng}`);
         const json = await res.json();

         const cs = this.getState();
         cs.petsAround = json;
         this.setState(cs);
      } catch (error) {
         console.error("Error fetching pets around", error);
      }
   },

   async getMyReportedPets() {
      const cs = this.getState();
      if (!cs.token) return [];

      try {
         const res = await fetch(`${API_BASE_URL}/user/pets`, {
            headers: { Authorization: `Bearer ${cs.token}` },
         });
         const json = await res.json();

         cs.myReportedPets = json;
         this.setState(cs);
         return json;
      } catch (error) {
         console.error("Error fetching my pets", error);
         return [];
      }
   },

   async fetchMyReportedPets() {
      await this.getMyReportedPets();
   },

   async createPetReport(petData: { name: string; location: string; lat: number; lng: number; dataURL: string }) {
      const cs = this.getState();
      try {
         const res = await fetch(`${API_BASE_URL}/pets`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${cs.token}`,
            },
            body: JSON.stringify(petData),
         });
         return await res.json();
      } catch (error) {
         console.error("Error creando reporte de mascota", error);
         return { success: false, error };
      }
   },

   async updatePetReport(petId: number, petData: { name: string; location: string; lat: number; lng: number; dataURL: string }): Promise<boolean> {
      const cs = this.getState();
      try {
         const res = await fetch(`${API_BASE_URL}/pets/${petId}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${cs.token}`,
            },
            body: JSON.stringify(petData),
         });
         return res.ok;
      } catch (error) {
         console.error("Error al actualizar mascota", error);
         return false;
      }
   },

   async deletePetReport(petId: number): Promise<boolean> {
      const cs = this.getState();
      try {
         const res = await fetch(`${API_BASE_URL}/pets/${petId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${cs.token}` },
         });
         return res.ok;
      } catch (error) {
         console.error("Error al eliminar mascota", error);
         return false;
      }
   },

   /* MÉTODOS DE AVISTAJES  */

   async sendPetAvistaje(avistajeData: { petId: number; reporterName: string; reporterPhone: string; locationDescription: string }) {
      try {
         const res = await fetch(`${API_BASE_URL}/reports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(avistajeData),
         });

         if (res.ok) {
            return await res.json();
         } else {
            return { success: false, error: "Error en el servidor" };
         }
      } catch (error) {
         console.error("Error sending avistaje", error);
         return { success: false, error };
      }
   },
};

export { state };