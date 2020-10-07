import { TitleService } from './../../services/title.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, HostListener, Input, Output, Type, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { merge, Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { DATA_REFRESH_SERVICE_TAG, DataRefreshItem, DataRefreshService } from '../../services/data-refresh.service';
import { UserMessageService } from '../../services/user-message.service';
import { DetailDialogComponent, DetailDialogData } from '../detail-dialog/detail-dialog.component';
import { GenericComponent } from '../generic-component/generic.component';
import { ApiActionsType, ApiPaginatorListResponse } from './../../api-datasource/api-datasource';
import { RicercaFormComponent } from '../ricerca/ricerca-form/ricerca-form.component';
import { FilterField } from '../ricerca/ricerca.model';


export abstract class ListComponent<T, LoginInfo> extends GenericComponent<T, LoginInfo> implements OnInit {

  abstract pageTitle: string;

  protected currentPath: string;

  isLoadingResults: boolean;
  listError: boolean = false;
  @Input() dataSource: T[] | MatTableDataSource<T>;
  selectedElement: T;
  @Output() onSelectElement = new EventEmitter<T>();
  @Output() onDoubleSelectElement = new EventEmitter<T>();
  protected dataSub: Subscription;

  protected refreshAll: boolean = true; //booleano per decidere se ricaricare tutta la lista al momento di un aggiornamento di un item
  protected detailTitle: string = "Dettaglio";
  protected detailSubTitle: string = null;
  protected detailComponentType: Type<any>;
  protected openDetailOnClick: boolean = true;
  protected detailDialogLoadFromServer: boolean = false;
  protected inSelectorDialog: boolean = false;
  /**
 * component di ricerca (se presente nel template HTML)
 */
  protected searchForm: RicercaFormComponent = null;

  protected searchApiUrl: string = null;
  protected canSaveSearch: boolean = false;

  constructor(protected httpClient: HttpClient,
    protected dataRefreshService: DataRefreshService,
    protected userMessageService: UserMessageService,
    protected router: Router,
    authService: AuthenticationService<LoginInfo>,
    public dialog: MatDialog,
    titleService: TitleService) {
    super(httpClient, userMessageService, authService, titleService);
    this.currentPath = this.router.url;
    this.sub.add(this.router.events.subscribe((val) => {
      this.onRouteChanged(val);
    }));
    /*if(this.dataSource == null && this.loadDataOnLoad){
      //se non è stato valorizzato dataSource tramite @Input, si chiama loadListData
      this.isLoadingResults = true;
    }*/
  }

  protected onRouteChanged(val: import("@angular/router").Event) {
    if (val instanceof NavigationEnd && val.url.endsWith(this.currentPath)) {
      this.onNavigationEnded(val);
      if (this.pageTitle && this.pageTitle != '') {
        this.titleService.updateTitle(this.pageTitle);
      }
    }
  }

  protected onNavigationEnded(val: NavigationEnd) {
    this.selectedElement = null;
  }

  ngOnInit(): void {
    if (this.dataSource == null && this.loadDataOnLoad) {
      //se non è stato valorizzato dataSource tramite @Input, si chiama loadListData
      this.loadListData();
    }
    this.sub.add(this.dataRefreshService.refresh.subscribe((res: DataRefreshItem) => {
      this.refreshFromService(res);
    }));
    if (this.pageTitle) {
      this.titleService.updateTitle(this.pageTitle);
    }

    //this.setupPaginatorAndSort();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }

  setupPaginatorAndSort() {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    this.dataSub = new Subscription();
    if (this.paginator) {
      if (this.sort) {
        this.dataSub.add(this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0));// If the user changes the sort order, reset back to the first page.
        this.dataSub.add(merge(this.sort.sortChange, this.paginator.page).subscribe(() => this.loadListData()));
      } else {
        this.dataSub.add(this.paginator.page.subscribe(() => this.loadListData()));
      }
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(ev: StorageEvent) {
    if (ev.key && ev.key.startsWith(DATA_REFRESH_SERVICE_TAG)) {
      /*console.log('onStorageChange', ev.key);
      console.log('oldValue', ev.oldValue);        
      console.log('newValue', ev.newValue);  */
      this.refreshFromService(JSON.parse(ev.newValue))
    }
  }

  /**
   * Si occupa di valutare se va eseguito il refresh dei dati della lista. In caso affermativo, fa il refresh
   * Esegue il refresh se LIST_NAME coincide con il ListName di res
   * Se refreshAll è true ricarica tutta la lista, altrimenti ricarica solo l'elemento
   * @param res DatRefreshItem<T> oggetto contenente le info da valutare per il refresh. 
   */
  refreshFromService(res: DataRefreshItem) {
    if (res && res.IdentifierName === this.LIST_NAME) {
      if (this.refreshAll || (res.ElementUpdatedId == null && res.ElementUpdated == null)) {
        //si ricarica tutta la lista se refreshAll è true o se non abbiamo info sul detail aggiornato
        this.loadListData();
      } else {
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
    this.setupPaginatorAndSort();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
    this.setupPaginatorAndSort();
  }

  setDataSourceAttributes() { }//utile per grid-list.component

  /**
   * metodo per aggiornare un elemento nella lista
   * Se è presente el si eseguono gli aggiornamenti della lista direttamente con questo dato
   * Se manca el e abbiamo id si chiede al server i dati
   * Se mancano el e id si logga un errore
   * @param action azione che è stata appena eseguita e che ha scatenato la chiamata di questo metodo
   * @param id id del detail da aggiungere/aggiornare/eliminare
   * @param el il detail completo
   */
  refreshItemList(action: ApiActionsType, id: any, el?: T) {
    if (el == null) {
      if (id) {
        //se abbiamo id
        if (action == ApiActionsType.DeleteAction) {
          //se è il caso di una delete, si toglie il rigo dalla lista/grid
          if (this.dataSource instanceof MatTableDataSource) {
            //caso della grid
            this.deleteItemRow(id);
          } else {
            //caso lista generica
            this.dataSource = this.dataSource.filter((item: T) => {
              return this.idExtractor(item) !== id;
            })
          }
        } else {
          //altrimenti si richiede il detail al server
          this.loadSingleRowById(id, action);
        }
      } else {
        //se mancano el e id, si logga l'impossibilità di esecuzione
        this.listError = true;
        console.log("ListComponent", "Impossibile ricaricare il dettaglio nella lista. Manca id");
      }
    } else {
      //se esiste el, si manipola direttamente il dataSource
      if (this.dataSource instanceof MatTableDataSource) {
        //gestione in caso di grid
        this.refreshItemRow(action, id, el);
      } else {
        switch (action) {
          case ApiActionsType.AddAction:
            this.dataSource.push(el);
            break;
          case ApiActionsType.UpdateAction:
            this.dataSource = this.dataSource.map((item: T) => {
              if (this.idExtractor(item) === this.idExtractor(el)) {
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
   * @param id id dell'elemento da eliminare dalla gird
   */
  deleteItemRow(id: any) {
    //TODO implementato in GridListComponent
  }

  /**
   * Chiamato da refreshItemList in caso si stia usando un GridListComponent
   * @param action azione che è stata appena eseguita
   * @param id id del detail da aggiungere/aggiornare/eliminare
   * @param el il detail completo 
   */
  refreshItemRow(action: ApiActionsType, id: any, el: T) {
    //TODO implementato in GridListComponent
  }

  loadSingleRowById(id: number | string, action: ApiActionsType = ApiActionsType.AddAction) {
    this.isLoadingResults = true;
    this.listError = false;
    this.sub.add(this.apiDatasource.getElement(id).subscribe((data) => {
      this.isLoadingResults = false;
      if (data != null) {
        this.refreshItemList(action, id, data);
      }
    }, (error) => {
      this.listError = true;
      console.error(error);
    }));
  }

  /**
   * carica la lista dal server. Volendo si può passare una funzione di callback da eseguire dopo onItemLoaded()
   * @param callback funzione di callback opzionale
   */
  loadListData(callback?: () => void) {
    this.isLoadingResults = true;
    this.listError = false;
    const params: HttpParams = this.prepareLoadParameters();
    this.sub.add(this.apiDatasource.getFilteredElements(params).subscribe((data: T[] | ApiPaginatorListResponse<T>) => {
      if (data['totalCount']) {
        this.resultsLength = data['totalCount'];
      }
      if (data['items']) {
        this.onListLoaded(data['items']);
      } else {
        this.onListLoaded(data as T[]);
      }
      if (callback != null) {
        callback();
      }
      this.isLoadingResults = false;
    }, (error) => {
      console.error("ListComponent: errore nel caricamento dati", error);
      this.isLoadingResults = false;
      this.listError = true;
    }));
  }

  protected prepareLoadParameters(): HttpParams {
    let params = new HttpParams();
    if (this.sort && this.sort.active) {
      params = params.set("sort", `${this.sort.active}`);
      params = params.set("order", `${this.sort.direction}`)
    }
    if (this.paginator) {
      params = params.set("page", `${this.paginator.pageIndex + 1}`);
      params = params.set("pageSize", `${this.paginator.pageSize}`);
    }
    if (this.dataSource && this.dataSource.filter) {
      params = params.set("filter", `${this.dataSource.filter}`);
    }
    if (this.searchForm) {
      const q = this.searchForm.prepareQueryParams();
      if (q != null && q != '') {
        params = params.set('q', q);
      }
    }
    return params;
  }

  protected onListLoaded(data: T[]) {
    this.dataSource = data;
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  /**
   * Metodo chiamato per filtrare i risultati
   * @param event evento generato contenente l'input con il valore con cui eseguire il filtro
   */
  applyFilter(event: Event): void {

  }

  /**
   * metodo per aprire un detail per inserire un nuovo elemento
   */
  addNewClicked() {
    if (this.isAuthorizedToModify()) {
      this.selectedElement = null;
      this.openDetail(null);
    }
  }

  openDetail(el: T) {
    if (this.subscribeRoute) {
      this.router.navigate([this.currentPath, el ? this.apiDatasource.apiIdExtractor(el) : 'new']);
    } else {
      this.openDetailDialog(el);
    }
  }

  /**
   * Apre dialog con detail component al suo interno
   * @param el element da aprire nel dialog
   */
  protected openDetailDialog(el: T = {} as T) {
    const dialogData: DetailDialogData<T> = this.getDetailDialogData(el);
    let dialogRef = this.dialog.open(DetailDialogComponent, {
      data: dialogData
    });
    this.sub.add(dialogRef.afterClosed().subscribe((result: T) => {
      this.loadListData();
    }));
  }

  /**
   * 
   * @param el element da caricare nel dialog (deve avere almeno id affinchè si possa caricare i dati dal server)
   * @param metaData Object che può contenere vari attributi da valorizzare per il
   */
  protected getDetailDialogData(el: T = {} as T): DetailDialogData<T> {
    if (this.detailComponentType == null) {
      throw Error("ListComponent: detailComponentType non instanziato");
    }
    const dialogData: DetailDialogData<T> = {
      detailComponent: this.detailComponentType,
      element: el,
      loadRemoteData: this.detailDialogLoadFromServer,
      title: this.detailTitle,
      subTitle: this.detailSubTitle,
      meta: this.getDetailMetaData(el)
    }
    return dialogData;
  }

  protected getDetailMetaData(el: T): Object {
    return {
      subscribeRoute: false,
    }
  }


  //************** GESTIONE CLICK E DOPPIO CLICK **************
  protected timer: any;
  protected delay = 200;
  protected prevent = false;

  /**
   * chiamato alla selezione di un item
   * @param item item selezionato
   */
  onItemSelected(item: T) {
    if (this.selectedElement == null || this.idExtractor(this.selectedElement) != this.idExtractor(item)) {
      this.selectedElement = item;
    } else {
      //altrimenti si deseleziona
      this.selectedElement = null;
    }
    this.onSelectElement.emit(this.selectedElement);
    if (this.openDetailOnClick && this.selectedElement != null) {
      this.openDetail(item);
    }
  }

  /**
   * chiamato alla doppia selezione di un item
   * NOTA: da sovrascrivere per stabilire un diverso comportamento dal semplice click
   * @param item item selezionato
   */
  onItemDoubleClick(item: T) {
    this.onDoubleSelectElement.emit(item);
  }

  /**
   * chiamato al click di una riga. Gestisce l'eventuale doppio click. Può essere annullato dal doppio click
   * NOTA: se non è previsto di usare il doppio click, si può usare direttamente la funzione onItemSelected
   * @param item item selezionato
   */
  onRowClicked(item: T) {
    let self = this;
    this.timer = setTimeout(function () {
      if (!self.prevent) {
        self.onItemSelected(item);
      }
      self.prevent = false;
    }, this.delay);
  }

  /**
   * chiamato al doppio click di una riga. Impedisce l'esecuzione della chiamata del singolo click
   * @param item item selezionato
   */
  onRowDoubleClicked(item: T) {
    clearTimeout(this.timer);
    this.prevent = true;
    this.onItemDoubleClick(item);
  }
  // ************** FINE GESTIONE CLICK E DOPPIO CLICK **************


  protected filterFields: FilterField[] = [];

  /**
    * setter per il component di ricerca 'RicercaFormComponent'
    */
  @ViewChild(RicercaFormComponent) set ricerca(rf: RicercaFormComponent) {
    if (rf) {
      this.searchForm = rf;
      setTimeout(() => {
        this.setFormFilterSettings();//TODO rimuovere timeout e correggere Expression has changed after it was checked
      }, 1000);
    }
  }

  /**
   * imposta i gli attributi e le subscription per il form di ricerca
   */
  setFormFilterSettings() {
    this.searchForm.sezione = this.LIST_NAME;
    this.searchForm.userId = this.authService.userId;
    this.searchForm.canSaveSearch = this.canSaveSearch;
    this.searchForm.searchApiUrl = this.searchApiUrl;
    this.setFormFilterFields();
    this.sub.add(this.searchForm.onFilterChanged.subscribe((_: string) => {
      this.loadListData();
    }));
  }

  /**
   * se true, ordina filterFields per il campo Label
   */
  protected orderFilterFields: boolean = true;

  /**
   * setta l'attributo fields di searchForm
   */
  setFormFilterFields() {
    if (this.searchForm) {
      if (this.orderFilterFields) {
        this.filterFields = this.filterFields.sort((a, b) => {
          return ('' + a.Label).localeCompare(b.Label);
        });
      }
      this.searchForm.fields = this.filterFields;
    }
  }

}