import { Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiDatasource } from '../../api-datasource/api-datasource';
import { AuthenticationService } from '../../services/authentication.service';

export abstract class GenericComponent<T, LoginInfo> implements OnDestroy {

    /**
   * indica se la navigazione tra lista e dettaglio segue la route o meno. Di default è true
   * Nel caso sia false, va settato element passandolo come input nel component
   */
  @Input() subscribeRoute: boolean = true;
  @Input() loadDataOnLoad: boolean = true;
  protected apiDatasource: ApiDatasource<T> | null;
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
  protected idExtractor: ((arg0: any) => any) = (el) => el.ID;

  protected sub: Subscription = new Subscription();

  constructor(
      protected authService: AuthenticationService<LoginInfo>) {
     }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  /**
   * Metodo per stabilire se si è autorizzati a modificare i dati
   */
  isAuthorizedToModify(){
    return this.authService.isAuthorized(this.contenuti_modifica);
  }
  
}
