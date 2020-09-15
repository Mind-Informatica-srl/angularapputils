import { Role } from './../models/ruolo.model';
import { AuthGuard } from './../auth/auth.guard';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { ListaRuoliComponent } from './lista-ruoli.component';
import { DetailRuoloComponent } from './detail-ruolo/detail-ruolo.component';

const routes: Routes = [
  {
    path: '',
    component: ListaRuoliComponent,
    canActivate: [AuthGuard],
    data: {
      animation: "RuoliPage",
      roles: [Role.Ruoli]
    },
    children: [
      {
        path: ':Id',
        component: DetailRuoloComponent,
        canActivate: [AuthGuard],
        data: {
          animation: "RuoloDetailPage",
          roles: [Role.Utenti]
        },
      },
    ]
  }
];


@NgModule({
  declarations: [
    ListaRuoliComponent,
    DetailRuoloComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
  ],
})
export class RuoliModule { }