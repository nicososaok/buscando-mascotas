import { initHome } from "./pages/home";
import { initReportPage } from "./pages/report";
import { initLogin } from "./pages/login";
import { initSignup } from "./pages/signup";
import { initProfile } from "./pages/profile";
import { initPasswordPage } from "./pages/password";
import { initMyReportsPage } from "./pages/my-reports";
import { initInfoPage } from "./pages/info";
import { initPetsNearbyPage } from "./pages/pets-nearby";
import { state } from "./state";

const routes = [
   {
      path: /\/(index\.html)?$/,
      handler: initHome,
   },
   {
      path: /\/info$/,
      handler: initInfoPage,
   },
   {
      path: /\/login$/,
      handler: initLogin,
   },
   {
      path: /\/signup$/,
      handler: initSignup,
   },
   {
      path: /\/profile$/,
      handler: initProfile,
   },
   {
      path: /\/profile\/password$/,
      handler: initPasswordPage,
   },
   {
      path: /\/my-reports$/,
      handler: initMyReportsPage,
   },
   {
      path: /\/report$/,
      handler: initReportPage,
   },
   {
      path: /\/pets-nearby$/,
      handler: initPetsNearbyPage,
   },
];

export function goTo(path: string) {
   if (location.pathname === path) return;

   history.pushState({}, "", path);
   window.dispatchEvent(new Event("popstate"));
}

export function initRouter(container: HTMLElement) {
   function handleRoute(route: string) {
      console.log("Navegando a:", route);

      const cs = state.getState();
      cs.currentRoute = route;

      for (const r of routes) {
         if (r.path.test(route)) {
            const el = r.handler();
            container.innerHTML = "";
            container.appendChild(el);
            return;
         }
      }

      console.warn(`Ruta "${route}" no encontrada. Renderizando Home por defecto.`);
      const homeEl = initHome();
      container.innerHTML = "";
      container.appendChild(homeEl);
   }

   window.addEventListener("load", () => {
      handleRoute(location.pathname);
   });

   window.addEventListener("popstate", () => {
      handleRoute(location.pathname);
   });
}