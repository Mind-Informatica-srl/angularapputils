import { UtenteDetailComponent } from './utente-detail/utente-detail.component';
import { Role } from './../models/ruolo.model';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { UtentiComponent } from './utenti.component';

const routes: Routes = [
  {
    path: '',
    component: UtentiComponent,
    data: {
      animation: "UtentiPage",
      roles: [Role.Utenti]
    },
    canActivate: [AuthGuard],
    children: [
      {
        path: ':Id',
        component: UtenteDetailComponent,
        data: {
          animation: "UtentiDetailPage",
          roles: [Role.Utenti]
        },
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [
    UtentiComponent,
    UtenteDetailComponent
  ]
})
export class UtentiModule { }