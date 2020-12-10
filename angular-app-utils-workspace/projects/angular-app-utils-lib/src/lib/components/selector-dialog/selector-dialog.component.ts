import { SortDirection } from '@angular/material/sort';
import { Inject, TemplateRef, ComponentFactoryResolver, ViewChild, ViewContainerRef, Type, OnInit, ComponentRef, Directive } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetailComponent } from '../detail/detail.component';
import { ListComponent } from '../list/list.component';

export interface DialogData<T> {

  listComponent?: Type<any>;//campo obbligatorio
  detailComponent?: Type<any>;//campo obbligatorio
  element: T;
  canEdit: boolean;
  elementId?: number | string;//se è valorizzato elementId, significa che il detail dovrà caricare da server le info, altrimenti si prendono da element
  chooseTitle?: string,
  selectedTitle?: string
  listMetaData?: any,
  detailMetaData?: any,
  showDetailIfSelected?: boolean;
  annullaTextBtn?: string;
  cambiaTextBtn?: string;
  selezionaTextBtn?: string;
}

export interface SelectorDialogDataResponse<T> {

  result: T;
  pageIndex?: number;
  rowsPerPage?: number;
  searchCreteria?: any;
  sortBy?: string;
  sortDirection?: SortDirection;

}

@Directive({
  selector: '[selectorDialogComponent]'
})
export class SelectorDialogComponent<T> implements OnInit {

  _preselectedElement: T;
  canEdit: boolean = false;
  chooseTitle: string = "Seleziona";
  selectedTitle: string = "Elemento selezionato";
  listTemplate: TemplateRef<any>;
  detailTemplate: TemplateRef<any>;
  showDetailIfSelected: boolean = true;
  annullaTextBtn: string = 'Annulla';
  cambiaTextBtn: string = 'Cambia';
  selezionaTextBtn: string = 'Seleziona';

  selectedElement: T;
  //@ViewChild(AdDirective, {static: true}) adHost: AdDirective;
  @ViewChild('listHost', { static: true, read: ViewContainerRef }) listHost: ViewContainerRef;
  @ViewChild('detailHost', { static: true, read: ViewContainerRef }) detailHost: ViewContainerRef;

  _detailComponentRef: ComponentRef<any>;

  get detailComponent(): DetailComponent<any, any> {
    try {
      return this._detailComponentRef.instance as any as DetailComponent<any, any>;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  _listComponentRef: ComponentRef<any>;

  get listComponent(): ListComponent<any, any> {
    try {
      return this._listComponentRef.instance as any as ListComponent<any, any>;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData<T>, protected componentFactoryResolver: ComponentFactoryResolver) {
    if (data.showDetailIfSelected != null) {
      this.showDetailIfSelected = data.showDetailIfSelected;
    }
    if (data.annullaTextBtn != null) {
      this.annullaTextBtn = data.annullaTextBtn;
    }
    if (data.selezionaTextBtn != null) {
      this.selezionaTextBtn = data.selezionaTextBtn;
    }
    if (data.cambiaTextBtn != null) {
      this.cambiaTextBtn = data.cambiaTextBtn;
    }
    this._preselectedElement = data.element;
    this.canEdit = data.canEdit;
    if (data.chooseTitle) {
      this.chooseTitle = data.chooseTitle
    }
    if (data.selectedTitle) {
      this.selectedTitle = data.selectedTitle
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

  /**
   * evento chiamato alla selezione di un Cliente dalla lista dei clienti disponibili
   * @param element Cliente
   */
  onSelectedElement(element: T) {
    this.selectedElement = element;
  }

  selectAndClose(element: T) {
    this.selectedElement = element;
    this.dialogRef.close(this.responseData);
  }

  removePreselected() {
    this._preselectedElement = null;
    this.loadAllComponents();
  }

  ngOnInit() {
    this.loadAllComponents();
  }

  loadAllComponents() {
    if ((!this.showDetailIfSelected || this._preselectedElement == null) && this.data.listComponent) {
      let comp = this.loadComponent(this.listHost, this.data.listComponent, this.data.listMetaData);
      this._listComponentRef = comp;
      //if (!comp || !comp.instance || !comp.instance.onCheckedChange) continue;
      if (comp && comp.instance) {
        comp.instance.selectedElement = this._preselectedElement;
        if (comp.instance.onSelectElement) {
          comp.instance.onSelectElement.subscribe(el => this.onSelectedElement(el));
        }
        if (comp.instance.onDoubleSelectElement) {
          comp.instance.onDoubleSelectElement.subscribe(el => this.selectAndClose(el));
        }
        comp.instance.inSelectorDialog = true;
      }

    } else {
      this.listHost.clear();
    }
    if (this.showDetailIfSelected && this._preselectedElement != null && this.data.detailComponent) {
      let comp = this.loadComponent(this.detailHost, this.data.detailComponent, this.data.detailMetaData);
      this._detailComponentRef = comp;
      if (this.data.elementId) {//se è valorizzato elementId, significa che il detail dovrà caricare da server le info, altrimenti si prendono da _preselectedElement
        if (comp && comp.instance && comp.instance.loadData) {
          //(<GenericComponent<T, any>>comp.instance).idExtractor(this._preselectedElement);
          comp.instance.loadData(this.data.elementId);
        }
      } else {
        comp.instance.element = this._preselectedElement;
      }
      comp.changeDetectorRef.detectChanges();
    } else {
      this.detailHost.clear();
    }
  }

  loadComponent(host: ViewContainerRef, component: Type<any>, metaData): ComponentRef<any> {
    host.clear();
    const factory = this.componentFactoryResolver.resolveComponentFactory(component);
    const ref = host.createComponent(factory);
    if (ref.instance) {
      if (metaData) {
        for (let attribute of Object.keys(metaData)) {
          ref.instance[attribute] = metaData[attribute];
        }
      }
      if (ref.instance.subscribeRoute != undefined) {
        ref.instance.subscribeRoute = false;
      }
      if (ref.instance.showOnlyPreview != undefined) {
        ref.instance.showOnlyPreview = true;
      }
      if (ref.instance.pageTitle) {
        //si toglie il pageTitle in modo da non chiamare il refresh title della navbar
        ref.instance.pageTitle = null;
      }
    }
    ref.changeDetectorRef.detectChanges();
    return ref;
  }

  get responseData(): SelectorDialogDataResponse<T> {
    return {
      result: this.selectedElement,
      pageIndex: this.listPageIndex,
      rowsPerPage: this.listRowsPerPage,
      searchCreteria: this.listSearchCreteria,
      sortBy: this.listSortBy,
      sortDirection: this.listSortDirection
    }
  }

  get listPageIndex(): number {
    if (this.listComponent && this.listComponent.paginator) {
      return this.listComponent.paginator.pageIndex;
    }
    return 0;
  }

  get listRowsPerPage(): number {
    if (this.listComponent && this.listComponent.paginator) {
      return this.listComponent.paginator.pageSize;
    }
    return 50;
  }

  get listSearchCreteria(): any {
    if (this.listComponent && this.listComponent.searchForm) {
      return this.listComponent.searchForm.prepareSearchToBeSaved('', this.listComponent.searchForm.selectedFilters);
    }
    return null;
  }

  get listSortBy(): string {
    if (this.listComponent && this.listComponent.sort && this.listComponent.sort.active) {
      return this.listComponent.sort.active;
    }
    return null;
  }

  get listSortDirection(): SortDirection {
    if (this.listComponent && this.listComponent.sort) {
      return this.listComponent.sort.direction;
    }
    return "asc";
  }

}
