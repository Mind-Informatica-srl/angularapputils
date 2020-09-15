import { StarterAuthenticationService } from './../auth/starter-authentication.service';
import { Role } from './../models/ruolo.model';
import { UtenteDetailComponent } from 'src/app/utenti/utente-detail/utente-detail.component';
import { Component } from '@angular/core';
import { GridListComponent, DataRefreshService, UserMessageService, DataRefreshItem, TitleService } from 'angular-app-utils-lib';
import { Utente } from '../models/utente.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UTENTI_LISTA_NAME } from '../shared/utils/constants';
import { routeAnimations } from '../shared/animations/route.animations';
import { MatDialog } from '@angular/material/dialog';
import { UTENTI_DUMMIES_DATA } from '../shared/utils/fake-utils-data';

@Component({
  selector: 'app-utenti',
  templateUrl: './utenti.component.html',
  styleUrls: [
    '../shared/styles/shared-style-detail.scss',
    '../shared/styles/shared-style-list.scss',
    './utenti.component.scss'
  ],
  animations: [
    routeAnimations,
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UtentiComponent extends GridListComponent<Utente, Utente> {

  pageTitle = "Utenti"

  contenuti_modifica = [Role.UtentiModifica];
  displayedColumns = ['Cognome', 'Nome', 'Email'];
  LIST_NAME = UTENTI_LISTA_NAME;
  apiDatasourcePath = environment.apiUrl + "utenti";

  constructor(
    httpClient: HttpClient,
    dataRefreshService: DataRefreshService,
    userMessageService: UserMessageService,
    router: Router,
    authService: StarterAuthenticationService,
    dialog: MatDialog,
    titleService: TitleService) {
    super(httpClient, dataRefreshService, userMessageService, router, authService, dialog, titleService);
    this.idExtractor = (el: Utente) => el?.Username;
    this.descriptionExtractor = (el: Utente) => el?.Nome + ' ' + el?.Cognome;
  }

  loadListData() {
    this.loadFakeData();
  }

  loadFakeData() {
    this.onListLoaded(UTENTI_DUMMIES_DATA);
    this.isLoadingResults = false;
  }

}