import { UTENTI_DUMMIES_DATA, RUOLI_DUMMIES_DATA } from './../../shared/utils/fake-utils-data';
import { Role, Ruolo } from './../../models/ruolo.model';
import { Component } from '@angular/core';
import { DetailComponent, DataRefreshService, UserMessageService, ApiActionsType, MessageType, CURRENT_USER_UPDATED, TitleService, ApiDatasource } from 'angular-app-utils-lib';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { StarterAuthenticationService } from '../../auth/starter-authentication.service';
import { UTENTI_LISTA_NAME } from 'src/app/shared/utils/constants';
import { Utente } from 'src/app/models/utente.model';

@Component({
  selector: 'app-utente-detail',
  templateUrl: './utente-detail.component.html',
  styleUrls: [
    '../../shared/styles/shared-style-detail.scss',
    './utente-detail.component.scss'
  ]
})
export class UtenteDetailComponent extends DetailComponent<Utente, Utente> {

  deleteDialogTitle = 'Richiesta eliminazione utente';
  deleteDialogMessage = "Vuoi eliminare l'utente?";
  apiDatasourcePath = environment.apiUrl + "utenti";
  LIST_NAME = UTENTI_LISTA_NAME;
  contenuti_modifica = [Role.UtentiModifica];

  ruoli: Ruolo[] = [];

  constructor(
    httpClient: HttpClient,
    route: ActivatedRoute,
    router: Router,
    dataRefreshService: DataRefreshService,
    userMessageService: UserMessageService,
    location: Location,
    dialog: MatDialog,
    authService: StarterAuthenticationService,
    titleService: TitleService) {
    super(httpClient, route, router, dataRefreshService, userMessageService, location, dialog, authService, titleService);
    this.idExtractor = (el: Utente) => el?.Username;
    this.descriptionExtractor = (el: Utente) => el?.Nome + ' ' + el?.Cognome;
    this.loadRuoli();
  }

  loadRuoli() {
    this.ruoli = RUOLI_DUMMIES_DATA;
    /*const contenutiDatasource: ApiDatasource<Ruolo> = new ApiDatasource(this.httpClient, environment.apiUrl + "ruoli", this.userMessageService);
    this.sub.add(contenutiDatasource.getElements().subscribe((res: Ruolo[]) => {
      this.ruoli = res;
    }));*/
  }

  //se si è modificato un utente che corrisponde all'utente loggato, si aggiorna Utente in currentLoginInfo
  onItemSaved(data: Utente, action: ApiActionsType) {
    super.onItemSaved(data, action);
    if (action == ApiActionsType.UpdateAction && this.authService.currentLoginInfoValue.Username === data.Username) {
      const loginInfo = {
        ...(this.authService as StarterAuthenticationService).currentLoginInfoValue,
        ...data
      }
      this.userMessageService.message({
        message: "Modificati i dati dell'utente loggato ...ricaricamento informazioni...",
        messageType: MessageType.Update
      })
      this.authService.updateUser(loginInfo);
      delete loginInfo.JwtToken;//non si passa nel localStorage il token (sicuramente non è stato cambiato dall'update)
      loginInfo['dummyData'] = new Date().getTime.toString();
      localStorage.setItem(CURRENT_USER_UPDATED, JSON.stringify(loginInfo));
    }
  }

  /**
   * si sovrascrive il metodo senza chiamarne il super dal momento che la route segue dei criteri diversi
   * in caso di insert siamo in http://localhost:4200/utenti/new/[email]
   * nel caso di update invece in http://localhost:4200/utenti/[id]
   * @param data utente da ricaricare
   */
  protected reload(data: Utente): void {
    if (this.subscribeRoute) {
      this.router.navigate(["../../", this.idExtractor(data)], {
        relativeTo: this.route
      });
    } else {
      this.refreshElement(data);
    }
  }

  loadData(id) {
    this.loadFakeData(id);
  }

  loadFakeData(id) {
    this.element = UTENTI_DUMMIES_DATA.find((el: Utente) => el.Username == id);
  }


}
