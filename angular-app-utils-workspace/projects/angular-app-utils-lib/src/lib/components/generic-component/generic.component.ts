import { TitleService } from './../../services/title.service';
import { Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiDatasource } from '../../api-datasource/api-datasource';
import { AuthenticationService } from '../../services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { UserMessageService } from '../../services/user-message.service';

export abstract class GenericComponent<T, LoginInfo> implements OnDestroy {

  /**
 * indica se la navigazione tra lista e dettaglio segue la route o meno. Di default è true
 * Nel caso sia false, va settato element passandolo come input nel component
 */
  @Input() subscribeRoute: boolean = true;
  @Input() loadDataOnLoad: boolean = true;
  private _apiDatasource: ApiDatasource<T> | null;

  /**
   * Il path da aggiungere alla url del server per le comunicazioni
   */
  abstract apiDatasourcePath: string;
  abstract LIST_NAME: string;//nome della lista a cui il dettaglio è legato. Serve per aggiornarla in caso di update
  /**
   * array di stringhe per stabilire se l'utente loggato è abilitato a modificare il detail
   */
  abstract contenuti_modifica: string[];
  /**
   * ricava la chiave primaria di element (di default è ID)
   */
  idExtractor: ((arg0: any) => any) = (el) => el?.ID;
  descriptionExtractor: ((arg0: any) => any) = (el) => el?.Descrizione;
  childrenExtractor: ((arg0: any) => T[]) = (el) => el?.Children;


  protected sub: Subscription = new Subscription();

  /**
   * solo se true, aggiorna il titleService nel metodo updateTitle
   */
  protected updateTitleService = false;

  constructor(
    protected httpClient: HttpClient,
    protected userMessageService: UserMessageService,
    protected authService: AuthenticationService<LoginInfo>,
    protected titleService: TitleService) {
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.updateTitleService) {
      this.titleService.updateTitle(null);
    }
  }

  protected get apiDatasource(): ApiDatasource<T> {
    if (!this._apiDatasource) {
      this._apiDatasource = new ApiDatasource(this.httpClient, this.apiDatasourcePath, this.userMessageService, this.idExtractor);
    }
    return this._apiDatasource;
  }

  protected set apiDatasource(val: ApiDatasource<T>) {
    this._apiDatasource = val;
  }

  /**
   * Metodo per stabilire se si è autorizzati a modificare i dati
   */
  isAuthorizedToModify() {
    return this.authService.isAuthorized(this.contenuti_modifica);
  }

  protected updateTitle(title: string) {
    if (this.updateTitleService) {
      this.titleService.updateTitle(title);
    }
  }

}
