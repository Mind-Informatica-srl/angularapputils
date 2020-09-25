import { Routes } from "@angular/router";

export const STARTER_ROUTES: Routes = [
  {
    path: "utenti",
    loadChildren: () => import('../utenti/utenti.module').then(m => m.UtentiModule)
  },
  {
    path: "ruoli",
    loadChildren: () => import('../ruoli/ruoli.module').then(m => m.RuoliModule)
  },


];
