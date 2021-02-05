import { ApiActionsType } from './../api-datasource/api-datasource';
import { BehaviorSubject, Observable } from 'rxjs';

export const DATA_REFRESH_SERVICE_TAG = 'data-refresh-service-tag.';
export const DATA_REFRESH_SERVICE_NEXT_TAG = 'data-refresh-service-next-tag.';

export interface DataRefreshItem {
  IdentifierName: string,
  Action: ApiActionsType,
  ElementUpdated?: any,
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
export class DataRefreshService {

  private refreshSub = new BehaviorSubject<DataRefreshItem>(null);
  refresh: Observable<DataRefreshItem>;//fare subscriptiona refresh per essere notificati di una modifica

  private nextDetailSub = new BehaviorSubject<DataRefreshItem>(null);
  nextDetail: Observable<DataRefreshItem>;

  constructor() {
    this.refresh = this.refreshSub.asObservable();
    this.nextDetail = this.nextDetailSub.asObservable();
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
  dataHasChange(name: string, action: ApiActionsType, elementUpdatedId: any, elementUpdated: any, refreshAllPages: boolean = true) {
    const params: DataRefreshItem = {
      IdentifierName: name,
      Action: action,
      ElementUpdatedId: elementUpdatedId,
      DummyString: new Date().getTime().toString() //senza questo il localStorage non si accorge del cambiamento (qualora si salvi due volte consecutive lo stesso detail)
    }
    //in localStorage non si passa elementUpdated per sicurezza. Si fornisce solo l'id della risorsa aggiornata (se presente)
    if (refreshAllPages) {
      localStorage.setItem(DATA_REFRESH_SERVICE_TAG + name, JSON.stringify(params));
    }
    params.ElementUpdated = elementUpdated;
    this.refreshSub.next(params);
  }

  askForNextDetail(name: string, action: ApiActionsType, oldElementId: any, data?: any, multiPage: boolean = false) {
    const params: DataRefreshItem = {
      IdentifierName: name,
      Action: action,
      ElementUpdatedId: oldElementId,
      DummyString: new Date().getTime().toString() //senza questo il localStorage non si accorge del cambiamento (qualora si salvi due volte consecutive lo stesso detail)
    }
    //in localStorage non si passa elementUpdated per sicurezza. Si fornisce solo l'id della risorsa aggiornata (se presente)
    if (multiPage) {
      localStorage.setItem(DATA_REFRESH_SERVICE_NEXT_TAG + name, JSON.stringify(params));
    }
    params.ElementUpdated = data;
    this.nextDetailSub.next(params);

  }

  //si rimuovono dal localStorage le vecchie cache del DataRefreshService
  //se name è valorizzato si rimuovono gli item correlati che terminano con name
  removeOldLocalStorage(name: string = '') {
    var arr = []; // Array to hold the keys
    // Iterate over localStorage and insert the keys that meet the condition into arr
    for (var i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if ((k.startsWith(DATA_REFRESH_SERVICE_TAG) || k.startsWith(DATA_REFRESH_SERVICE_NEXT_TAG)) && k.endsWith(name)) {
        arr.push(k);
      }
    }

    // Iterate over arr and remove the items by key
    for (var i = 0; i < arr.length; i++) {
      localStorage.removeItem(arr[i]);
    }
  }
}
