import { routeAnimations } from './../../shared/animations/route.animations';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { RUOLI_LIST_NAME } from './../../shared/utils/constants';
import { environment } from './../../../environments/environment';
import { Contenuto } from './../../models/contenuto.model';
import { DetailComponent, DataRefreshService, UserMessageService, TitleService, ApiDatasource } from "angular-app-utils-lib";
import { Ruolo, Role } from "../../models/ruolo.model";
import { Utente } from "../../models/utente.model";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { StarterAuthenticationService } from '../../auth/starter-authentication.service';
import { CONTENUTI_DUMMIES_DATA, RUOLI_DUMMIES_DATA } from 'src/app/shared/utils/fake-utils-data';


@Component({
  selector: "app-detail-ruolo",
  templateUrl: "./detail-ruolo.component.html",
  styleUrls: ['../../shared/styles/shared-style-detail.scss',
    "./detail-ruolo.component.scss"
  ],
  animations: [
    routeAnimations
  ]
})
export class DetailRuoloComponent extends DetailComponent<Ruolo, Utente> {
  apiDatasourcePath = environment.apiUrl + 'ruoli';
  LIST_NAME = RUOLI_LIST_NAME;
  contenuti_modifica = [Role.AziendeModifica];


  contenuti: Contenuto[];

  constructor(
    httpClient: HttpClient,
    route: ActivatedRoute,
    router: Router,
    dataRefreshService: DataRefreshService,
    userMessageService: UserMessageService,
    location: Location,
    dialog: MatDialog,
    authService: StarterAuthenticationService,
    titleService: TitleService
  ) {
    super(httpClient, route, router, dataRefreshService, userMessageService, location, dialog, authService, titleService);
    this.idExtractor = (el: Ruolo) => el?.Id;
    this.descriptionExtractor = (el: Ruolo) => el?.Nome;
    this.loadContenuti();
  }

  loadContenuti() {
    this.contenuti = CONTENUTI_DUMMIES_DATA;
    /*const contenutiDatasource: ApiDatasource<Contenuto> = new ApiDatasource(this.httpClient, environment.apiUrl + "contenuti", this.userMessageService, (el: Contenuto) => el?.CodContenuto);
    this.sub.add(contenutiDatasource.getElements().subscribe((res: Contenuto[]) => {
      this.contenuti = res;
    }));*/
  }

  loadData(id) {
    this.loadFakeData(id);
  }

  loadFakeData(id) {
    this.element = RUOLI_DUMMIES_DATA.find((el: Ruolo) => el.Id == id);
  }

  prepareForNewItem() {
    super.prepareForNewItem();
    this.element = {} as Ruolo;
    this.element.Contenuti = [];
  }

  onContenutoClicked(event: MatCheckboxChange) {
    const id = event.source.value;
    if (event.checked) {
      const contenuto = this.contenuti.find(r => {
        return r.CodContenuto == id;
      });
      const rc = {} as Contenuto;
      rc.CodContenuto = contenuto.CodContenuto;
      this.element.Contenuti.push(rc);
    } else {
      const contenuto = this.element.Contenuti.find(r => {
        return r.CodContenuto == id;
      });
      const index = this.element.Contenuti.indexOf(contenuto, 0);
      this.element.Contenuti.splice(index, 1);
    }
  }

  isContenutoChecked(id) {
    return !!this.element.Contenuti.find(r => {
      return r.CodContenuto === id;
    });
  }
}
