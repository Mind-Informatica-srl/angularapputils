import { RUOLI_DUMMIES_DATA } from './../shared/utils/fake-utils-data';
import { StarterAuthenticationService } from './../auth/starter-authentication.service';
import { RUOLI_LIST_NAME } from './../shared/utils/constants';
import { Role, Ruolo } from '../models/ruolo.model';
import { environment } from '../../environments/environment';
import { Utente } from '../models/utente.model';
import { GridListComponent, DataRefreshService, UserMessageService, TitleService } from 'angular-app-utils-lib';
import { routeAnimations } from '../shared/animations/route.animations';
import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-lista-ruoli',
    templateUrl: './lista-ruoli.component.html',
    styleUrls: [
        '../shared/styles/shared-style-list.scss',
    ],
    animations: [
        routeAnimations
    ]

})
export class ListaRuoliComponent extends GridListComponent<Ruolo, Utente> {

    displayedColumns = ['Nome', 'Descrizione'];
    pageTitle = 'Ruoli';
    apiDatasourcePath = environment.apiUrl + 'ruoli';
    LIST_NAME = RUOLI_LIST_NAME;
    contenuti_modifica = [Role.RuoliModifica];

    constructor(
        httpClient: HttpClient,
        dataRefreshService: DataRefreshService,
        userMessageService: UserMessageService,
        router: Router,
        authService: StarterAuthenticationService,
        dialog: MatDialog,
        titleService: TitleService) {
        super(httpClient, dataRefreshService, userMessageService, router, authService, dialog, titleService);
        this.idExtractor = (el: Ruolo) => el?.Id;
        this.descriptionExtractor = (el: Ruolo) => el?.Descrizione;
    }

    loadListData() {
        this.loadFakeData();
    }

    loadFakeData() {
        this.onListLoaded(RUOLI_DUMMIES_DATA);
        this.isLoadingResults = false;
    }


}


