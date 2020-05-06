import { ApiActionsType } from './../api-datasource/api-datasource';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DataRefreshItem<T> {
    ListName: string,
    Action: ApiActionsType,
    ElementUpdated: T
}

/*@Injectable({
    providedIn:"root"
})*/
export class DataRefreshService<T> {

  private refreshSub = new BehaviorSubject<DataRefreshItem<T>>(null);
  refresh: Observable<DataRefreshItem<T>>;

  constructor() {
      this.refresh = this.refreshSub.asObservable();
  }

  /**
   * 
   * @param name nome della lista e dettaglio di cui si deve eseguire il refresh
   * @param elementUpdated elemento aggiornato di tipo T
   * @param action azione eseguita di tipo ApiAction
   */
  dataHasChange(name: string, elementUpdated?: T, action?: ApiActionsType) {
    this.refreshSub.next({
        ListName: name, 
        Action: action,  
        ElementUpdated: elementUpdated
    });
  }
}
