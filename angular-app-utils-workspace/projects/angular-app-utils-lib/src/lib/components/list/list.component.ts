import { ApiActionsType, ApiPaginatorListResponse } from './../../api-datasource/api-datasource';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AfterViewInit, Output, EventEmitter, Input, ViewChild, HostListener } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { GenericComponent } from '../generic-component/generic.component';
import { DataRefreshService, DataRefreshItem, DATA_REFRESH_SERVICE_TAG } from '../../services/data-refresh.service';
import { UserMessageService } from '../../services/user-message.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ApiDatasource } from '../../api-datasource/api-datasource';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { merge } from 'rxjs';


export abstract class ListComponent<T, LoginInfo> extends GenericComponent<T, LoginInfo> implements AfterViewInit {

  abstract displayedColumns: string[];
  abstract pageTitle: string;

  currentPath: string;

  isLoadingResults: boolean = false;
  listError: boolean = false;
  @Input() dataSource: T[] | MatTableDataSource<T>;
  selectedElement: T;
  @Output() onSelectElement = new EventEmitter<T>();

  protected refreshAll: boolean = true; //booleano per decidere se ricaricare tutta la lista al momento di un aggiornamento di un item

  constructor(protected httpClient: HttpClient,
    protected dataRefreshService: DataRefreshService<T>,
    protected userMessageService: UserMessageService,
    protected router: Router,
    authService: AuthenticationService<LoginInfo>) {
      super(authService);
      this.currentPath = this.router.url;
      this.sub.add(this.router.events.subscribe((val) => {
        this.onRouteChanged(val);
      }));
      if(this.dataSource == null && this.loadDataOnLoad){
        //se non è stato valorizzato dataSource tramite @Input, si chiama loadListData
        this.isLoadingResults = true;
      }      
  }

  protected onRouteChanged(val: import("@angular/router").Event) {
    if(val instanceof NavigationEnd && val.url.endsWith(this.currentPath)){
      this.onNavigationEnded(val);
    }  
  }

  protected onNavigationEnded(val: NavigationEnd) {
    this.selectedElement = null;
  }
  
  ngAfterViewInit(): void {
    this.apiDatasource = new ApiDatasource(this.httpClient, this.apiDatasourcePath, this.userMessageService, this.idExtractor);
    if(this.dataSource == null && this.loadDataOnLoad){
      //se non è stato valorizzato dataSource tramite @Input, si chiama loadListData
      this.loadListData();
    }
    this.sub.add(this.dataRefreshService.refresh.subscribe((res: DataRefreshItem<T>) => {
      this.refreshFromService(res);
    }));
    if(this.paginator){
      // If the user changes the sort order, reset back to the first page.
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      merge(this.sort.sortChange, this.paginator.page).subscribe(() => this.loadListData());
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(ev: StorageEvent) {
    if(ev.key && ev.key.startsWith(DATA_REFRESH_SERVICE_TAG)){
       /*console.log('onStorageChange', ev.key);
       console.log('oldValue', ev.oldValue);        
       console.log('newValue', ev.newValue);  */
       this.refreshFromService(JSON.parse(ev.newValue) )
    }     
  }

  /**
   * Si occupa di valutare se va eseguito il refresh dei dati della lista. In caso affermativo, fa il refresh
   * Esegue il refresh se LIST_NAME coincide con il ListName di res
   * Se refreshAll è true ricarica tutta la lista, altrimenti ricarica solo l'elemento
   * @param res DatRefreshItem<T> oggetto contenente le info da valutare per il refresh. 
   */
  refreshFromService(res: DataRefreshItem<T>) {
    if(res && res.IdentifierName === this.LIST_NAME){
      if(this.refreshAll || (res.ElementUpdatedId == null && res.ElementUpdated == null)){
        //si ricarica tutta la lista se refreshAll è true o se non abbiamo info sul detail aggiornato
        this.loadListData();
      }else{
        //si aggiorna il solo elemento
        this.refreshItemList(res.Action, res.ElementUpdatedId, res.ElementUpdated);
      }
    }
  }

  protected sort: MatSort;
  protected paginator: MatPaginator;
  resultsLength = 0;//campo utile per il paginator per l'input [length]

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {}//utile per grid-list.component

  /**
   * metodo per aggiornare un elemento nella lista
   * Se è presente el si eseguono gli aggiornamenti della lista direttamente con questo dato
   * Se manca el e abbiamo id si chiede al server i dati
   * Se mancano el e id si logga un errore
   * @param action azione che è stata appena eseguita e che ha scatenato la chiamata di questo metodo
   * @param id id del detail da aggiungere/aggiornare/eliminare
   * @param el il detail completo
   */
  refreshItemList(action: ApiActionsType, id: any, el?: T){
    if(el == null){
      if(id){
        //se abbiamo id, si richiede il detail al server
        this.loadSingleRowById(id, action);
      }else{
        //se mancano el e id, si logga l'impossibilità di esecuzione
        this.listError = true;
        console.log("ListComponent", "Impossibile ricaricare il dettaglio nella lista. Manca id");          
      }
    }else{
      //se esiste el, si manipola direttamente il dataSource
      if(this.dataSource instanceof MatTableDataSource){
        //gestione in caso di grid
        this.refreshItemRow(action, id, el);
      }else{
        switch (action) {
          case ApiActionsType.AddAction:
            this.dataSource.push(el);
            break;
          case ApiActionsType.UpdateAction:
            this.dataSource = this.dataSource.map((item: T) => {
              if(this.idExtractor(item) === this.idExtractor(el)){
                return el;
              }
              return item;
            });
            break;
          case ApiActionsType.DeleteAction:
            this.dataSource = this.dataSource.filter((item: T) => {
              return this.idExtractor(item) !== this.idExtractor(el);
            })
            break;      
          default:
            break;
        }
      }
      
    }
  }

  /**
   * Chiamato da refreshItemList in caso si stia usando un GridListComponent
   * @param action azione che è stata appena eseguita
   * @param id id del detail da aggiungere/aggiornare/eliminare
   * @param el il detail completo 
   */
  refreshItemRow(action: ApiActionsType, id: any, el: T){
    //TODO implementato in GridListComponent
  }
  
  loadSingleRowById(id: number | string, action: ApiActionsType = ApiActionsType.AddAction) {
    this.isLoadingResults = true;
    this.listError = false;
    this.sub.add(this.apiDatasource.getElement(id).subscribe((data) => {
      this.isLoadingResults = false;
      if(data != null){
        this.refreshItemList(action, id, data);
      }
    },(error) => {
      this.listError = true;
      console.error(error);      
    }));
  }

  /**
   * carica la lista dal server. Volendo si può passare una funzione di callback da eseguire dopo onItemLoaded()
   * @param callback funzione di callback opzionale
   */
  loadListData(callback?: () => void ) {
    this.isLoadingResults = true;
    this.listError = false;
    const params: HttpParams = this.prepareLoadParameters();
    this.sub.add(this.apiDatasource.getFilteredElements(params).subscribe((data: T[] | ApiPaginatorListResponse<T>) => {
      if(data['totalCount']){
        this.resultsLength = data['totalCount'];
      }
      if(data['items']){
        this.onListLoaded(data['items']);
      }else{
        this.onListLoaded(data as T[]);
      }
      if(callback != null){
        callback();
      }
      this.isLoadingResults = false;
    },(error) => {
      console.error("ListComponent: errore nel caricamento dati", error);
      this.isLoadingResults = false;
      this.listError = true;
    }));
  }
  
  prepareLoadParameters(): HttpParams {
    let params = new HttpParams();
    if(this.sort){
      params = params.set("sort", `${this.sort.active}`);
      params = params.set("order", `${this.sort.direction}`)
    }
    if(this.paginator){
      params = params.set("page", `${this.paginator.pageIndex + 1}`);
      params = params.set("pageSize", `${this.paginator.pageSize}`);
    }
    if(this.dataSource && this.dataSource.filter){
      params = params.set("filter", `${this.dataSource.filter}`);
    }
    return params;
  }

  onListLoaded(data: T[]){
    this.dataSource = data;    
  }

  onItemSelected(item: T){
    if(this.selectedElement == null || this.idExtractor(this.selectedElement) != this.idExtractor(item)){
      this.selectedElement = item;
    }else{
      //altrimenti si deseleziona
      this.selectedElement = null;
    }
    this.onSelectElement.emit(this.selectedElement);
    if(this.subscribeRoute){
      this.router.navigate([this.currentPath, this.apiDatasource.apiIdExtractor(this.selectedElement)]);
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  /**
   * Metodo chiamato per filtrare i risultati
   * @param event evento generato contenente l'input con il valore con cui eseguire il filtro
   */
  applyFilter(event: Event): void{
    
  }

}