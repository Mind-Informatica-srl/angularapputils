import { TitleService } from './../../services/title.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, HostListener, Input, Output, Type, ViewChild, OnInit, AfterViewInit, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Directive } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { merge, Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { DATA_REFRESH_SERVICE_TAG, DataRefreshItem, DataRefreshService, DATA_REFRESH_SERVICE_NEXT_TAG } from '../../services/data-refresh.service';
import { UserMessageService } from '../../services/user-message.service';
import { DetailDialogComponent, DetailDialogData } from '../detail-dialog/detail-dialog.component';
import { GenericComponent } from '../generic-component/generic.component';
import { ApiActionsType, ApiPaginatorListResponse } from './../../api-datasource/api-datasource';
import { RicercaFormComponent } from '../ricerca/ricerca-form/ricerca-form.component';
import { FilterField, Filtro } from '../ricerca/ricerca.model';
import { HtmlContainerDialogComponent } from '../html-container-dialog/html-container-dialog.component';
import { StampaDialogData, StampaModalComponent } from '../stampa/stampa-modal/stampa-modal.component';
import { CampoStampaInterface, getPrintFormat, StampaFormConfig, StampaModalResponse } from '../stampa/stampa.model';
import * as FileSaver from 'file-saver';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


@Directive()
export abstract class ListComponent<T, LoginInfo> extends GenericComponent<T, LoginInfo> implements OnInit, AfterViewInit {

  abstract pageTitle: string;

  protected currentPath: string;

  /**
   * true se si stanno caricando i dati dal server
   */
  isLoadingResults: boolean;
  /**
   * stringa di errore da valorizzare quando si hanno errori dal server
   */
  listError: boolean = false;
  /**
   * contiene i dati della lista
   * 
   * T[] | MatTableDataSource<T>
   */
  @Input() dataSource: T[] | MatTableDataSource<T>;
  /**
   * elemento selezionato al momento
   */
  selectedElement: T;
  @Output() onSelectElement = new EventEmitter<T>();
  @Output() onDoubleSelectElement = new EventEmitter<T>();
  protected dataSub: Subscription;

  /**
   * indice della prima pagina del paginator da mostrare
   */
  @Input() firstPageIndex: number = 0;
  /**
   * numero di righe per pagina del paginator
   */
  @Input() rowsPerPage: number = 0;
  @Input() searchCreteria: Filtro;
  /**
   * nome della colonna per cui si deve filtrare
   */
  @Input() sortBy: string;
  /**
   * ordine "", "desc" o "asc" (SortDirection) per cui si deve filtrare
   */
  @Input() sortDirection: SortDirection;

  /**
   * booleano per decidere se ricaricare tutta la lista al momento di un aggiornamento di un item
   */
  protected refreshAll: boolean = true;
  /**
   * titolo del detail (per apertura in modale)
   */
  protected detailTitle: string = "Dettaglio";
  /**
   * sottotitolo del detail (per apertura in modale)
   */
  protected detailSubTitle: string = null;
  /**
   * detail component (per apertura in modale)
   */
  protected detailComponentType: Type<any>;
  /**
   * se true, al click del rigo apre il detail
   */
  protected openDetailOnClick: boolean = true;
  /**
   * se true, al doppio click del rigo apre il detail
   */
  protected openDetailOnDoubleClick: boolean = false;

  /**
   * se true il detail nellla modale carica i dati dal server
   */
  protected detailDialogLoadFromServer: boolean = false;
  protected inSelectorDialog: boolean = false;

  /**
   * se true: se selectedElement è già valorizzato, lo deseleziona in onItemSelected
   */
  protected deselectOnSecondClick: boolean = true;

  protected searchApiUrl: string = null;

  constructor(protected httpClient: HttpClient,
    protected dataRefreshService: DataRefreshService,
    protected userMessageService: UserMessageService,
    protected router: Router,
    authService: AuthenticationService<LoginInfo>,
    public dialog: MatDialog,
    titleService: TitleService,
    protected componentFactoryResolver: ComponentFactoryResolver) {
    super(httpClient, userMessageService, authService, titleService);
    this.currentPath = this.router.url;
    this.sub.add(this.router.events.subscribe((val) => {
      this.onRouteChanged(val);
    }));
    this.setAttribute();
    /*if(this.dataSource == null && this.loadDataOnLoad){
      //se non è stato valorizzato dataSource tramite @Input, si chiama loadListData
      this.isLoadingResults = true;
    }*/
  }

  /**
   * Metodo chiamato nel costruttore per poter settare eventuali attributi
   */
  setAttribute() {

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
    this.dataRefreshService.removeOldLocalStorage(this.LIST_NAME);
    if (this.dataSource == null && this.loadDataOnLoad) {
      //se non è stato valorizzato dataSource tramite @Input, si chiama loadListData
      this.loadListData();
    }
    this.sub.add(this.dataRefreshService.refresh.subscribe((res: DataRefreshItem) => {
      this.refreshFromService(res);
    }));
    this.sub.add(this.dataRefreshService.nextDetail.subscribe((res: DataRefreshItem) => {
      this.goToNextDetail(res);
    }));
    if (this.pageTitle) {
      this.titleService.updateTitle(this.pageTitle);
    }
    //si carica il filtro
    this.loadSearchFormComponent();
    //this.setupPaginatorAndSort();
  }

  ngAfterViewInit(): void {

  }

  /**
   * seleziona l'elemento successivo
   * @param res DataRefreshItem
   */
  goToNextDetail(res: DataRefreshItem) {
    if (res && res.IdentifierName == this.LIST_NAME) {
      if (!res.ElementUpdatedId != null) {
        const nextElement = this.getNextDetail(res.ElementUpdatedId);
        if (nextElement) {
          if (this.openDetailOnClick) {
            this.onRowClicked(nextElement);
          } else {
            this.onRowDoubleClicked(nextElement);
          }
          // this.onItemSelected(nextElement);
        }
      }
    }
  }

  get dataSourceArray(): T[] {
    return (this.dataSource as T[]);
  }

  getNextDetail(oldId: any): T {
    const d = this.dataSourceArray;
    const oldIndex = d.findIndex(el => this.idExtractor(el) == oldId);
    if (oldIndex > -1) {
      //se abbiamo trovato oldIndex
      let nextIndex: number;
      if (oldIndex < d.length - 1) {
        nextIndex = oldIndex + 1;
      } else {
        nextIndex = 0;
      }
      return d[nextIndex];
    }
    return null;
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
      if (this.firstPageIndex != 0) {
        this.paginator.pageIndex = this.firstPageIndex;
      }
      if (this.rowsPerPage != 0) {
        this.paginator.pageSize = this.rowsPerPage;
      }
      if (this.sort) {
        if (this.sortBy) {
          this.sort.active = this.sortBy;
          if (this.sortDirection) {
            this.sort.direction = this.sortDirection;
          }
        }
        this.dataSub.add(this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0));// If the user changes the sort order, reset back to the first page.
        this.dataSub.add(merge(this.sort.sortChange, this.paginator.page).subscribe(() => this.loadListData()));
      } else {
        this.dataSub.add(this.paginator.page.subscribe(() => this.loadListData()));
      }
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(ev: StorageEvent) {
    if (ev.key) {
      if (ev.key.startsWith(DATA_REFRESH_SERVICE_TAG)) {
        /*console.log('onStorageChange', ev.key);
        console.log('oldValue', ev.oldValue);        
        console.log('newValue', ev.newValue);  */
        this.refreshFromService(JSON.parse(ev.newValue))
      }
      if (ev.key.startsWith(DATA_REFRESH_SERVICE_NEXT_TAG)) {
        this.goToNextDetail(JSON.parse(ev.newValue))
      }
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

  sort: MatSort;
  paginator: MatPaginator;
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
            this.dataSource = this.refreshItemListDeleted(el, id, this.dataSource);
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
            this.refreshItemListAdded(el, this.dataSource);
            break;
          case ApiActionsType.UpdateAction:
            this.dataSource = this.refreshItemListUpdated(el, this.dataSource);
            break;
          case ApiActionsType.DeleteAction:
            this.dataSource = this.refreshItemListDeleted(el, id, this.dataSource);
            break;
          default:
            break;
        }
      }

    }
  }

  /**
   * Si cicla cercando l'elemento dentro list che non ha id (e cioè è stato appena salvato su server), in modo da sovrascriverlo con i dati ottenuti dal server
   * viene usato in refreshItemList dove si sovrascrive il comportamento in caso di AddAction in quanto si deve andare a valutare anche 
   * gli attributi Children di ogni sinfolo elemento del datasource
   * 
   * @param el elemento da aggiornare
   * @param list lista in cui cercare l'elemento da sostituire con el
   */
  refreshItemListAdded(el: T, list: T[]): boolean {
    if(list){
      const itemToUpdateIndex = list.findIndex(item => this.idExtractor(item) == null);
      if (itemToUpdateIndex >= 0) {
          //si sotituisce l'elemento senza id con quello appena creato (NOTA: ovviamente dovrebbe esserci solo un unico elemento senza id nella lista)
          list.splice(itemToUpdateIndex, 1, el);
          return true;
      } else {
        //altrimenti si cerca tra i figli
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          const children = this.childrenExtractor(item);
          if(children){
            let ok = this.refreshItemListAdded(el, children);
            if(ok){
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  refreshItemListUpdated(el: T, list: T[]): T[]{
    if(list){
      list = list.map((item: T) => {
        let children = this.childrenExtractor(item);
        if(children){
          children = this.refreshItemListUpdated(el, children);
        }
        if (this.idExtractor(item) === this.idExtractor(el)) {
          return this.refreshSingleElement(item, el);//prima era return el
        }
        return item;
      });
    }
    return list;
  }

  refreshItemListDeleted(el: T, id: any, list: T[]): T[] {
    if(list){
      list = list.filter((item: T) => {
        return this.idExtractor(item) != (id != null ? id : this.idExtractor(el));
      });
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        let children = this.childrenExtractor(item);
        if(children){
          children = this.refreshItemListDeleted(el, id, children);
        }
      }
    }
    return list;
  }

  protected refreshSingleElement(oldData: T, newData: T): T {
    for (let attribut in newData) {
      oldData[attribut] = newData[attribut];
    }
    return oldData;
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

  /**
   * restituisce i parametri per filtrare la request al server
   * 
   * return HttpParams
   */
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

  /**
   * chiamato quando si ottengono i dati dal server
   * @param data T[]
   */
  protected onListLoaded(data: T[]) {
    this.dataSource = data;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
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

  /**
   * apre la modale o naviga al path del detail
   * 
   * @param el element da visualizzare nel detail
   */
  openDetail(el: T) {
    if (this.subscribeRoute) {
      this.router.navigate([this.currentPath, el ? this.apiDatasource.apiIdExtractor(el) : 'new']);
    } else {
      this.openDetailDialog(el);
    }
  }

  /**
   * Max-width of the dialog. If a number is provided, assumes pixel units. Defaults to 80vw.
   */
  get maxWidthDialog(): string {
    return '80vw';
  }
  /**
   * Apre dialog con detail component al suo interno
   * @param el element da aprire nel dialog
   */
  protected openDetailDialog(el: T = {} as T) {
    const dialogData: DetailDialogData<T> = this.getDetailDialogData(el);
    let dialogRef = this.dialog.open(DetailDialogComponent, {
      data: dialogData,
      maxWidth: this.maxWidthDialog
    });
    this.sub.add(dialogRef.afterClosed().subscribe((result: T) => {
      let callback = () => {
        if(this.selectedElement && this.dataSourceArray){
          //dopo aver chiuso il detail si verifica esista sempre selectedElement nella lista
          const s = this.dataSourceArray.find(el => this.idExtractor(el) == this.idExtractor(this.selectedElement));
          //se nel dialog è stato cancellato l'elemento, si rimuove selectedElement
          if(!s){
            this.selectedElement = null;
          }
        }
      };
      this.loadListData(callback);
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
      saveText: this.detailSaveText(),
      deleteText: this.detailDeleteText(),
      meta: this.getDetailMetaData(el)
    }
    return dialogData;
  }

  /**
   * metodo che restituisce il testo per il pulsante di salvataggio del detail che si apre nella modale
   * 
   * return string
   */
  protected detailSaveText(): string {
    return 'Salva';
  }

  /**
   * metodo che restituisce il testo per il pulsante di cancellazione del detail che si apre nella modale
   * 
   * return string
   */
  protected detailDeleteText(): string {
    return 'Elimina';
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
      if(this.deselectOnSecondClick){
        this.selectedElement = null;
      }
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
    if(this.openDetailOnDoubleClick){
      this.openDetail(item);
    }
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
  protected printFields: CampoStampaInterface[] = [];


  @ViewChild('searchHost', { static: true, read: ViewContainerRef }) searchHost: ViewContainerRef;
  _searchComponentRef: ComponentRef<any>;

  /**
  * component di ricerca (se presente nel template HTML)
  */
  get searchForm(): RicercaFormComponent {
    try {
      return this._searchComponentRef.instance as any as RicercaFormComponent;
    } catch (ex) {
      return null;
    }
  }

  loadSearchFormComponent() {
    if (this.searchHost != null) {
      this.searchHost.clear();
      const factory = this.componentFactoryResolver.resolveComponentFactory(RicercaFormComponent);
      this._searchComponentRef = this.searchHost.createComponent(factory);
      this.setFormFilterSettings();
      this._searchComponentRef.changeDetectorRef.detectChanges();
    }
  }

  /**
    * setter per il component di ricerca 'RicercaFormComponent'
    */
  // @ViewChild(RicercaFormComponent) set ricerca(rf: RicercaFormComponent) {
  //   if (rf && !this.searchForm) {
  //     this.searchForm = rf;
  //     this.setFormFilterSettings();//TODO rimuovere timeout e correggere Expression has changed after it was checked
  //   }
  // }

  /**
   * imposta i gli attributi e le subscription per il form di ricerca
   */
  setFormFilterSettings() {
    this.searchForm.sezione = this.LIST_NAME;
    this.searchForm.userId = this.authService.userId;
    this.searchForm.searchApiUrl = this.searchApiUrl;
    this.setFormFilterFields();
    if (this.searchCreteria) {
      this.searchForm.onSavedSearchClicked(this.searchCreteria);
    }
    this.sub.add(this.searchForm.onFilterChanged.subscribe((_: string) => {
      if (!this.isLoadingResults) {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadListData();
      }
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

  protected printApiUrl: string;


  print(columns: string[], format: string, headers: string[]) {
    let params = this.prepareLoadParameters();
    format = getPrintFormat(format);
    this.apiDatasource.printElements(columns, headers, params, format, format == 'text' ? 'text' : 'json').subscribe((data: any) => {
      console.log(data);
      if (format == 'text') {
        this.downloadCsv(data);
      } else if (format == 'blob') {
        this.showPdf(data)
      }
    }, error => {
      console.error(error);

    });
  }

  get csvTitle(): string {
    return this.pageTitle != null ? (this.pageTitle + '.csv') : 'export.csv';
  }
  downloadCsv(data: any) {
    const blob = new Blob([data], { type: 'text/csv' });
    FileSaver.saveAs(blob, this.csvTitle);
  }

  showPdf(res: any) {
    if (res.Error) {
      this.userMessageService.message({
        errorMessage: res.Error,
        error: res.Error
      });
    } else {
      let dialogRef = this.dialog.open(HtmlContainerDialogComponent, {
        //width: '50%',
        data: {
          htmlTitle: res.Response.Title,
          htmlBody: res.Response.Body,
          htmlOkButton: 'Stampa',
          styleString: res.Response.Style
        }
      });
      // this.sub.add(dialogRef.afterOpened().subscribe(() => {
      //   dialogRef.componentInstance.print();
      // }));
    }
  }

  protected preparePrintDialogParams(): StampaDialogData {
    return {
      config: {
        Sezione: this.LIST_NAME,
        UtenteID: this.authService.userId,
        ColumnNames: this.printFields,
        SelectedColumnNames: this.getDefaultSelectedPrintColumn(),
        LayoutApiUrl: this.printApiUrl,
      } as StampaFormConfig
    }
  }

  protected getDefaultSelectedPrintColumn(): CampoStampaInterface[] {
    return [];
  }

  private _orderPrintFileds: boolean = true;

  protected orderPrintFiled() {
    if (this._orderPrintFileds && this.printFields) {
      this.printFields = this.printFields.sort((a, b) => {
        return ('' + a.Description).localeCompare(b.Description);
      });
      this._orderPrintFileds = false;//si mette a false per eseguire l'ordinamento solo la prima volta
    }
  }

  openStampaDialog() {
    this.orderPrintFiled();
    const dialogData: StampaDialogData = this.preparePrintDialogParams();
    let dialogRef = this.dialog.open(StampaModalComponent, {
      data: dialogData
    });
    this.sub.add(dialogRef.afterClosed().subscribe((result: StampaModalResponse) => {
      if (result) {
        this.print(result.Campi, result.Formato, result.Headers);
      }
    }));
  }

  /**
   * se true, al drop di un item della lista, si invia la richiesta di salvataggio al server
   */
  protected onDropSaveListOrder: boolean = true;
  /**
   * Nome del campo che contiene l'informazione sull'ordinamento
   */
  protected ordineFieldName: string = 'Ordine';

  /**
   * Salva sul server il nuovo ordinamento
   * 
   * Se si ha errore, ricarica la lista
   * 
   * @param list T[]
   * @param path path finale da aggiungere per dire al server di aggiornare l'ordine della lista
   */
  saveListOrder(list: T[], path: string = 'updateorder'){
    if(this.isAuthorizedToModify()){
      this.apiDatasource.updateListOrder(list, path).subscribe(res => {
        console.log(res);
        this.onListOrderSaved(res);
      }, _ => {
        this.loadListData();
      }); 
    }
  }

  onListOrderSaved(res: any[]) {
  }

  /**
   * da chiamare al drop di un item nella lista
   * riordina dataSourceArray
   * @param event CdkDragDrop<string[]>
   */
  dropItem(event: CdkDragDrop<string[]>) {
    if(event.previousContainer === event.container) {
      this.prepareSingleListToOrderSave(event.previousIndex, event.currentIndex, this.ordineFieldName);
    }else{
      this.prepareMultipleListToOrderSave(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    } 
    if(this.onDropSaveListOrder){
      this.saveListOrder(this.dataSourceArray);
    }
  }

  prepareMultipleListToOrderSave(previousContainerData: string[], containerData: string[], previousIndex: number, currentIndex: number) {
    transferArrayItem(previousContainerData, containerData, previousIndex, currentIndex);
  }

  /**
   * aggiorna dataSourceArray ed i campi di ordinamento
   * 
   * @param previousIndex indice vecchio
   * @param currentIndex nuovo indice
   * @param ordineFieldName nome del campo contenente l'informazione sull'ordinamento
   */
  prepareSingleListToOrderSave(previousIndex: number, currentIndex: number, ordineFieldName:string = 'Ordine'){
    moveItemInArray(this.dataSourceArray, previousIndex, currentIndex);
    for (let i = 0; i < this.dataSourceArray.length; i++) {
      const item = this.dataSourceArray[i];
      item[ordineFieldName] = i;
    }
  }

}