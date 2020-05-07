import { ApiActionsType } from './../../api-datasource/api-datasource';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AfterViewInit, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { GenericComponent } from '../generic-component/generic.component';
import { DataRefreshService, DataRefreshItem } from '../../services/data-refresh.service';
import { UserMessageService } from '../../services/user-message.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ApiDatasource } from '../../api-datasource/api-datasource';


export abstract class ListComponent<T, LoginInfo> extends GenericComponent<T, LoginInfo> implements AfterViewInit {

  abstract displayedColumns: string[];
  abstract pageTitle: string;

  
  currentPath: string;

  isLoadingResults: boolean = true;
  listError: boolean = false;
  dataSource: T[] | MatTableDataSource<T>;
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
    this.loadListData();
    this.sub.add(this.dataRefreshService.refresh.subscribe((res: DataRefreshItem<T>) => {
      if(res && res.ListName === this.LIST_NAME){
        if(this.refreshAll){
          //si ricarica tutta la lista
          this.loadListData();
        }else{
          //si aggiorna il solo elemento
          this.refreshItemList(res.ElementUpdated, res.Action);
        }
      }
    }));
  }

  /**
   * metodo per aggiornare un elemento nella lista
   * @param el elemento da aggiornare nella lista
   */
  refreshItemList(el: T, action: ApiActionsType){
    if(this.dataSource instanceof MatTableDataSource){
      //TODO
      
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
  
  /**
   * carica la lista dal server. Volendo si può passare una funzione di callback da eseguire dopo onItemLoaded()
   * @param callback funzione di callback opzionale
   */
  loadListData(callback?: () => void ) {
    this.isLoadingResults = true;
    this.listError = false;
    const params: HttpParams = this.prepareLoadParameters();
    this.sub.add(this.apiDatasource.getFilteredElements(params).subscribe((data) => {
      this.onItemLoaded(data);
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
    return new HttpParams();
  }

  onItemLoaded(data: T[]){
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
