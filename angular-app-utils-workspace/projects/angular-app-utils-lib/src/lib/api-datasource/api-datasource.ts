import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserMessageService, MessageType } from '../services/user-message.service';

export enum ApiActionsType {
  AddAction,
  UpdateAction,
  DeleteAction,
  ErrorAction
}

export class ApiDatasource<T> {
  requestUrl: string;
  //httpHeaders: HttpHeaders;
  private idExtractor: ((arg0: any) => any) = (element) => element.ID;

  get apiIdExtractor(){
    return this.idExtractor;
  }
  
  constructor(private _httpClient: HttpClient, 
    private path: string, 
    protected userMessageService: UserMessageService,
    idExtractor?: ((arg0: any) => any)
    ) {
    this.requestUrl = this.path;
    /*this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8;',
      'access-control-allow-origin': '*',
    })*/
    if(idExtractor != null) {
      this.idExtractor = idExtractor
    }
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

  getElement(id: any): Observable<T> {
    const url = `${this.requestUrl}/${id}`;
    return this._httpClient.get<T>(url)
    .pipe(
      catchError(err => {
        return this.onError(null, err);
      })
    );
  }

  update(element: T): Observable<T>{
    const id = this.idExtractor(element);
    const url = `${this.requestUrl}/${id}`;
    return this._httpClient.put<T>(url, JSON.stringify(element)/*, {headers: this.httpHeaders}*/).pipe(
      catchError(err => {
        return this.onError(element, err);
      })
      //catchError(ApiDatasource.handleError)
    ).pipe(
      tap(res => {
        this.userMessageService.message({
          element: res,
          messageType: MessageType.Update
        });
      })
    );
  }

  insert(element: T): Observable<T>{
    return this._httpClient.post<T>(this.requestUrl, element/*, {headers: this.httpHeaders}*/).pipe(
      catchError(err => {
        return this.onError(element, err);
      })
      //catchError(ApiDatasource.handleError)
    ).pipe(
      tap(res => {
        this.userMessageService.message({
          element: res,
          messageType: MessageType.Insert
        });
      })
    );
  }

  delete(element: T): Observable<any>{
    const id = this.idExtractor(element);
    const url = `${this.requestUrl}/${id}`;
    return this._httpClient.delete(url/*, {headers: this.httpHeaders}*/).pipe(
      catchError(err => {
        return this.onError(element, err);
      })
      //catchError(ApiDatasource.handleError)
    ).pipe(
      tap(res => {
        this.userMessageService.message({
          element: res,
          messageType: MessageType.Delete
        });
      })
    );
  }

  private onError(element: T, err: any){
    this.userMessageService.message({
      element: element,
      error: err,
      messageType: MessageType.Error
    });
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

}


export interface ApiPaginatorListResponse<T> {
  items: T[];
  totalCount: number;
}