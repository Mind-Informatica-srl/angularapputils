import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserMessageService, MessageType } from '../services/user-message.service';

export interface OrderInterface {
  ID: any,
  Ordine: number
}

export enum ApiActionsType {
  AddAction,
  UpdateAction,
  DeleteAction,
  ErrorAction
}

export class ApiDatasource<T> {
  //httpHeaders: HttpHeaders;
  private idExtractor: ((arg0: any) => any) = (element) => element.ID;
  private ordineExtractor : ((arg0: any) => any) = (element) => element.Ordine;
  httpHeaders: HttpHeaders;

  get apiIdExtractor() {
    return this.idExtractor;
  }

  set apiOrdineExtractor(val: (arg0: any) => any) {
    this.ordineExtractor = val;
  }

  constructor(protected _httpClient: HttpClient,
    public requestUrl: string,
    protected userMessageService?: UserMessageService,
    idExtractor?: ((arg0: any) => any)
  ) {
    if (idExtractor != null) {
      this.idExtractor = idExtractor
    }
    this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Restituisce lista di oggetti
   */
  getElements(): Observable<T[] | ApiPaginatorListResponse<T>> {
    return this.getFilteredElements(null);
  }

  /**
   * Restituisce array o ApiPaginatorListResponse costituito da array lista più attributo con il totale della lista (per esempio, per irportarlo sul totale del paginator)
   * @param params HttpParams parametri per filtrare la lista
   */
  getFilteredElements(params: HttpParams): Observable<T[] | ApiPaginatorListResponse<T>> {
    return this._httpClient.get<T[] | ApiPaginatorListResponse<T>>(this.requestUrl, { params })
      .pipe(
        catchError(err => {
          return this.onError(null, err);
        })
      );
  }

  getElement(id: any, params?: HttpParams): Observable<T> {
    const url = `${this.requestUrl}/${id}`;
    return this._httpClient.get<T>(url, { params })
      .pipe(
        catchError(err => {
          return this.onError(null, err);
        })
      );
  }

  getHttpHeadersForUpdate(): HttpHeaders {
    return this.httpHeaders;
  }

  getHttpHeadersForInsert(): HttpHeaders {
    return this.httpHeaders;
  }

  getHttpHeadersForDelete(): HttpHeaders {
    return this.httpHeaders;
  }

  update(element: T, params?: HttpParams): Observable<T> {
    const url = `${this.requestUrl}/${this.idExtractor(element)}`;
    const headers = this.getHttpHeadersForUpdate();
    return this._httpClient.put<T>(url, JSON.stringify(element), { headers: headers, params: params }).pipe(
      catchError(err => {
        return this.onError(element, err);
      })
    ).pipe(
      tap(res => {
        if (this.userMessageService) {
          this.userMessageService.message({
            element: res,
            messageType: MessageType.Update
          });
        }
      })
    );
  }

  insert(element: T,params?: HttpParams): Observable<T> {
    const headers = this.getHttpHeadersForInsert();
    return this._httpClient.post<T>(this.requestUrl, element, { headers: headers, params: params }).pipe(
      catchError(err => {
        return this.onError(element, err);
      })
    ).pipe(
      tap(res => {
        if (this.userMessageService) {
          this.userMessageService.message({
            element: res,
            messageType: MessageType.Insert
          });
        }
      })
    );
  }

  delete(element: T, params?: HttpParams): Observable<any> {
    const url = `${this.requestUrl}/${this.idExtractor(element)}`;
    const headers = this.getHttpHeadersForDelete();
    return this._httpClient.delete(url, { headers: headers, params: params }).pipe(
      catchError(err => {
        return this.onError(element, err);
      })
    ).pipe(
      tap(res => {
        if (this.userMessageService) {
          this.userMessageService.message({
            element: res,
            messageType: MessageType.Delete
          });
        }
      })
    );
  }

  /**
   * 
   * @param list array da ordinare su server
   * @param path path finale per chiamata al server
   */
  updateListOrder(list: T[], path: string = 'updateorder'): Observable<OrderInterface[]> {
    let listToSend: OrderInterface[] = [];
    list.forEach(el => {
      listToSend.push({
        ID: this.idExtractor(el),
        Ordine: this.ordineExtractor(el)
      });
    });
    const url = `${this.requestUrl}/${path}`;
    const headers = this.getHttpHeadersForUpdate();
    return this._httpClient.put<OrderInterface[]>(url, listToSend, { headers: headers }).pipe(
      catchError(err => {
        return this.onError(null, err);
      })
    ).pipe(
      tap(res => {
        if (this.userMessageService) {
          this.userMessageService.message({
            element: res,
            messageType: MessageType.Update
          });
        }
      })
    );
  }

  updateList(list: T[], path: string = 'updatelist'): Observable<T[]>{
    const url = `${this.requestUrl}/${path}`;
    const headers = this.getHttpHeadersForUpdate();
    return this._httpClient.put<T[]>(url, list, { headers: headers }).pipe(
      catchError(err => {
        return this.onError(null, err);
      })
    ).pipe(
      tap(res => {
        if (this.userMessageService) {
          this.userMessageService.message({
            element: res,
            messageType: MessageType.Update
          });
        }
      })
    );
  }

  protected onError(element: T, err: any) {
    if (this.userMessageService) {
      this.userMessageService.message({
        element: element,
        error: err,
        errorMessage: typeof err == "string" ? err : null,
        messageType: MessageType.Error
      });
    }
    ApiDatasource.handleError(err);
    return throwError(err);
  }

  public static handleError(error: any) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Qualcosa è andato storto; riprovare più tardi.');
  }

  printElements(columns: string[], titles: string[], params: HttpParams, format: string = 'text', responseType: any = 'json'): Observable<any> {
    const headers = this.getHttpHeadersForPrint(format, columns, titles);
    return this._httpClient.get(this.requestUrl, { headers: headers, params: params, responseType: responseType }).pipe(
      catchError(err => {
        return this.onError(null, err);
      })
    );
  }

  protected getHttpHeadersForPrint(format: string, columns: string[], titles: string[]): HttpHeaders {
    return new HttpHeaders({
      'Print': format,
      'Titles': titles,
      's': columns
    });
  }

  /**
   * Metodo per richiedere la stampa di un elemento in uno specifico formato
   * 
   * @param id id dell'elemento da stampare
   * @param fields campi da stampare
   * @param titles titoli dei campi
   * @param params HttpParams per filtrare la richiesta
   * @param format format di output richiesto (csv,pdf, etc..)
   * @param responseType tipo di response atteso (json, text, blob,arraybuffer)
   */
  printElement(id: any, params?: HttpParams, format: string = 'text', responseType: any = 'json', fields?: string[], titles?: string[]): Observable<any> {
    const headers = this.getHttpHeadersForPrint(format, fields, titles);
    const url = `${this.requestUrl}/${id}`;
    return this._httpClient.get(url, { headers: headers, params: params, responseType: responseType }).pipe(
      catchError(err => {
        return this.onError(null, err);
      })
    );
  }

}


export interface ApiPaginatorListResponse<T> {
  items: T[];
  totalCount: number;
}