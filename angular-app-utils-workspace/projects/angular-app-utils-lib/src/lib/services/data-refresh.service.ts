import { ApiActionsType } from './../api-datasource/api-datasource';
import { BehaviorSubject, Observable } from 'rxjs';

export const DATA_REFRESH_SERVICE_TAG = 'data-refresh-service-tag.';

export interface DataRefreshItem<T> {
    IdentifierName: string,
    Action: ApiActionsType,
    ElementUpdated?: T,
    ElementUpdatedId: any,
    DummyString?: string //serve solo per il localStorage
}
/**
 * Servizio per comunicare cambiamenti all'interno della app 
 * Utile per comunicazioni list/grid e detail
 */

/*@Injectable({
    providedIn:"root"
})*/
export class DataRefreshService<T> {

  private refreshSub = new BehaviorSubject<DataRefreshItem<T>>(null);
  refresh: Observable<DataRefreshItem<T>>;//fare subscriptiona refresh per essere notificati di una modifica

  constructor() {
      this.refresh = this.refreshSub.asObservable();
      this.removeOldLocalStorage();
  }

  /**
   * 
   * @param name nome dell'oggetto che deve essere notificato (es lista o grid) e dettaglio di cui si deve eseguire il refresh
   * @param action azione eseguita di tipo ApiAction
   * @param elementUpdatedId id dell'item aggiornato
   * @param elementUpdated elemento aggiornato di tipo T
   * @param refreshAllPages se true manda la notifica attraverso localStorage a tutte le tab aperte
   */
  dataHasChange(name: string, action: ApiActionsType, elementUpdatedId: any, elementUpdated: T, refreshAllPages: boolean = true) {
    const params: DataRefreshItem<T> = {
      IdentifierName: name, 
      Action: action,  
      ElementUpdatedId: elementUpdatedId,
      DummyString: new Date().getTime().toString() //senza questo il localStorage non si accorge del cambiamento (qualora si salvi due volte consecutive lo stesso detail)
    }
    //in localStorage non si passa elementUpdated per sicurezza. Si fornisce solo l'id della risorsa aggiornata (se presente)
    if(refreshAllPages){
      localStorage.setItem(DATA_REFRESH_SERVICE_TAG + name, JSON.stringify(params));
    }
    params.ElementUpdated = elementUpdated;
    this.refreshSub.next(params);
  }

  //si rimuovono dal localStorage le vecchie cache del DataRefreshService
  removeOldLocalStorage() {
    var arr = []; // Array to hold the keys
    // Iterate over localStorage and insert the keys that meet the condition into arr
    for (var i = 0; i < localStorage.length; i++){
        if (localStorage.key(i).startsWith(DATA_REFRESH_SERVICE_TAG)) {
            arr.push(localStorage.key(i));
        }
    }

    // Iterate over arr and remove the items by key
    for (var i = 0; i < arr.length; i++) {
        localStorage.removeItem(arr[i]);
    }
  }
}
