import { SortDirection } from "@angular/material/sort";
import {
  Inject,
  ComponentFactoryResolver,
  ViewChild,
  ViewContainerRef,
  Type,
  OnInit,
  ComponentRef,
  Component,
  Input,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DetailComponent } from "../detail/detail.component";
import { ListComponent } from "../list/list.component";

export interface DialogData<T> {
  listComponent?: Type<any>; // campo obbligatorio
  detailComponent?: Type<any>; // campo obbligatorio
  element: T;
  canEdit: boolean;
  /**
   * se è valorizzato elementId, significa che il detail dovrà caricare da server le info, altrimenti si prendono da element
   */
  elementId?: number | string;
  chooseTitle?: string;
  selectedTitle?: string;
  listMetaData?: any;
  detailMetaData?: any;
  showDetailIfSelected?: boolean;
  annullaTextBtn?: string;
  cambiaTextBtn?: string;
  selezionaTextBtn?: string;
  style2?: boolean;
}

export interface SelectorDialogDataResponse<T> {
  result: T | undefined;
  pageIndex?: number;
  rowsPerPage?: number;
  searchCreteria?: any;
  sortBy?: string;
  sortDirection?: SortDirection;
}

@Component({
  selector: "aaul-selector-dialog",
  templateUrl: "./selector-dialog.component.html",
  styleUrls: ["./selector-dialog.component.scss"],
})
export class SelectorDialogComponent<T> implements OnInit {
  /**
   * eventuale elemento già preselezionato al momento dell'apertura
   * del dialog
   */
  _preselectedElement: T | null = null;
  /**
   * true se si può modificare
   * false se si può solo visualizzare
   */
  canEdit: boolean = false;
  /**
   * titolo del dialog
   */
  chooseTitle: string = "Seleziona";
  /**
   * titolo del detail
   */
  selectedTitle: string = "Elemento selezionato";
  // listTemplate?: TemplateRef<any>;
  // detailTemplate?: TemplateRef<any>;
  /**
   * true se si deve mostrare il component del detail
   * quando si seleziona una riga dal list component
   */
  showDetailIfSelected: boolean = true;
  /**
   * testo del pulsante per chiudere dialog
   */
  annullaTextBtn: string = "Annulla";
  /**
   * testo per pulsante cambia
   */
  cambiaTextBtn: string = "Cambia";
  /**
   * testo per pulsante di selezione
   */
  selezionaTextBtn: string = "Seleziona";

  /**
   * eventuale elemento che è stato selezionato
   */
  selectedElement?: T;

  /**
   * host in cui è ospitato il list component nel template html
   */
  @ViewChild("listHost", { static: true, read: ViewContainerRef })
  listHost!: ViewContainerRef;
  /**
   * host in cui è ospitato il detail component nel template html
   */
  @ViewChild("detailHost", { static: true, read: ViewContainerRef })
  detailHost!: ViewContainerRef;

  _detailComponentRef?: ComponentRef<any>;

  get detailComponent(): DetailComponent<any, any> | null {
    try {
      return this._detailComponentRef?.instance as any as DetailComponent<
        any,
        any
      >;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  _listComponentRef?: ComponentRef<any>;

  get listComponent(): ListComponent<any, any> | null {
    try {
      return this._listComponentRef?.instance as any as ListComponent<any, any>;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  /**
   * permette di passare in input tramite template html i valori
   * da attribuire a data: DialogData<T>
   */
  @Input() set dataParams(val: DialogData<T> | undefined) {
    if (val) {
      this.data = val;
      this.onDataSetted();
    }
  }

  /**
   * chiamato quando viene valorizzato this.data
   */
  onDataSetted(): void {
    if (this.data) {
      if (this.data.showDetailIfSelected != null) {
        this.showDetailIfSelected = this.data.showDetailIfSelected;
      }
      if (this.data.annullaTextBtn != null) {
        this.annullaTextBtn = this.data.annullaTextBtn;
      }
      if (this.data.selezionaTextBtn != null) {
        this.selezionaTextBtn = this.data.selezionaTextBtn;
      }
      if (this.data.cambiaTextBtn != null) {
        this.cambiaTextBtn = this.data.cambiaTextBtn;
      }
      this._preselectedElement = this.data.element;
      this.canEdit = this.data.canEdit;
      if (this.data.chooseTitle) {
        this.chooseTitle = this.data.chooseTitle;
      }
      if (this.data.selectedTitle) {
        this.selectedTitle = this.data.selectedTitle;
      }
    }
  }

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData<T>,
    protected componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.onDataSetted();
  }

  /**
   * chiamato alla chiusura del dialog tramite il pulsante annulla
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * evento chiamato alla selezione di un elemento dalla lista
   * @param element T
   */
  onSelectedElement(element: T): void {
    this.selectedElement = element;
  }

  /**
   * seleziona l'elemento e chiude il dialog passando
   * l'elemento selezionato
   * @param element T
   */
  selectAndClose(element: T): void {
    this.selectedElement = element;
    this.dialogRef.close(this.responseData);
  }

  removePreselected(): void {
    this._preselectedElement = null;
    this.loadAllComponents();
  }

  ngOnInit(): void {
    this.loadAllComponents();
  }

  /**
   * carica i template del list e/o detail
   */
  loadAllComponents(): void {
    if (
      (!this.showDetailIfSelected || this._preselectedElement == null) &&
      this.data.listComponent
    ) {
      const comp = this.loadComponent(
        this.listHost,
        this.data.listComponent,
        this.data.listMetaData
      );
      this._listComponentRef = comp;
      // if (!comp || !comp.instance || !comp.instance.onCheckedChange) continue;
      if (comp && comp.instance) {
        comp.instance.selectedElement = this._preselectedElement;
        if (comp.instance.onSelectElement) {
          comp.instance.onSelectElement.subscribe((el: T) =>
            this.onSelectedElement(el)
          );
        }
        if (comp.instance.onDoubleSelectElement) {
          comp.instance.onDoubleSelectElement.subscribe((el: T) =>
            this.selectAndClose(el)
          );
        }
        comp.instance.inSelectorDialog = true;
      }
    } else {
      this.listHost.clear();
    }
    if (
      this.showDetailIfSelected &&
      this._preselectedElement != null &&
      this.data.detailComponent
    ) {
      const comp = this.loadComponent(
        this.detailHost,
        this.data.detailComponent,
        this.data.detailMetaData
      );
      this._detailComponentRef = comp;
      if (this.data.elementId) {
        // se è valorizzato elementId, significa che il detail dovrà caricare
        // da server le info, altrimenti si prendono da _preselectedElement
        if (comp && comp.instance && comp.instance.loadData) {
          // (<GenericComponent<T, any>>comp.instance).idExtractor(this._preselectedElement);
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

  /**
   * carica un component dentro il template html
   * @param host ViewContainerRef
   * @param component Type<any>
   * @param metaData any
   * @returns
   */
  loadComponent(
    host: ViewContainerRef,
    component: Type<any>,
    metaData: any
  ): ComponentRef<any> {
    host.clear();
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(component);
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
        // si toglie il pageTitle in modo da non chiamare il refresh title della navbar
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
      sortDirection: this.listSortDirection,
    };
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
      return this.listComponent.searchForm.prepareSearchToBeSaved(
        "",
        this.listComponent.searchForm.selectedFilters
      );
    }
    return null;
  }

  get listSortBy(): string {
    if (
      this.listComponent &&
      this.listComponent.sort &&
      this.listComponent.sort.active
    ) {
      return this.listComponent.sort.active;
    }
    return "";
  }

  get listSortDirection(): SortDirection {
    if (this.listComponent && this.listComponent.sort) {
      return this.listComponent.sort.direction;
    }
    return "asc";
  }
}
