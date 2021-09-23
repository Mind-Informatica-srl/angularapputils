import { HostListener } from "@angular/core";
import {
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
  Inject,
  ComponentFactoryResolver,
  ComponentRef,
  Component,
  OnDestroy,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { DetailReactiveComponent } from "../detail-reactive/detail-reactive.component";
import { DetailComponent } from "../detail/detail.component";

/**
 * detailComponent: Type<any>; Tipo del component di tipo DetailComponent
 *
 * element: T;  Elemento da caricare nel detail (per caricare i dati dal server è necessario che almeno l'id sia valorizzato).
 *
 * loadRemoteData?: boolean;  se true carica i dati dal server, altrimenti li prende da element
 *
 * title: string, titolo del dialog
 *
 * subTitle?: string, eventuale sottotitolo del dialog
 *
 * meta?: Object  parametri aggiuntivi del detail component che vengono istanziati in setupDetailComponent del DetailDialogComponent
 *
 * disableCloseOnClickOutside se true, disabilita la chiusura della modal se si clicca fuori da essa
 */
export interface DetailDialogData<T> {
  detailComponent: Type<any>; // campo obbligatorio
  element?: T;
  loadRemoteData?: boolean;
  title: string;
  subTitle?: string;
  saveText?: string;
  deleteText?: string;
  meta?: Object;
  saveElementOnOkPressed: boolean;
  deleteElementOnNoPressed: boolean;
}

/**
 * Permette di aprire un dialog con all'interno un DetailComponent
 */
@Component({
  selector: "app-detail-dialog",
  templateUrl: "./detail-dialog.component.html",
  styleUrls: ["./detail-dialog.component.scss"],
})
export class DetailDialogComponent implements OnInit, OnDestroy {
  _detailComponentRef: ComponentRef<any>;
  title: string = "Dettaglio selezionato";
  subTitle: string = null;
  saveText: string = "Salva";
  deleteText: string = "Elimina";

  protected sub: Subscription = new Subscription();

  //detailTemplate: TemplateRef<any>;

  get detailComponent():
    | DetailComponent<any, any>
    | DetailReactiveComponent<any, any> {
    try {
      return this._detailComponentRef.instance as any as DetailComponent<
        any,
        any
      >;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  //@ViewChild('detailHost') _detailComponent: TemplateRef<any>;

  //@ViewChild(AdDirective, {static: true}) adHost: AdDirective;
  @ViewChild("detailHost", { static: true, read: ViewContainerRef })
  detailHost: ViewContainerRef;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: DetailDialogData<any>,
    protected componentFactoryResolver: ComponentFactoryResolver
  ) {
    if (data.title) {
      this.title = data.title;
    }
    if (data.subTitle) {
      this.subTitle = data.subTitle;
    }
    if (data.saveText) {
      this.saveText = data.saveText;
    }
    if (data.deleteText) {
      this.deleteText = data.deleteText;
    }
    this.dialogRef.disableClose = true;
  }

  onOkClicked(): void {
    if (this.data.saveElementOnOkPressed) {
      this.detailComponent.save();
    } else {
      this.closeDialog(this.detailComponent.isValid);
    }
  }

  onNoClicked() {
    if (this.data.deleteElementOnNoPressed) {
      this.detailComponent.delete();
    } else {
      this.detailComponent.element = null;
      this.closeDialog(true);
    }
  }

  closeDialog(forceClose: boolean = false) {
    if (
      this._detailComponentRef &&
      this._detailComponentRef.instance &&
      this._detailComponentRef.instance.closeDetail
    ) {
      this._detailComponentRef.instance.closeDetail(forceClose);
    } else {
      this.dialogRef.close();
    }
  }

  /**
   * evento chiamato alla selezione di un Cliente dalla lista dei clienti disponibili
   * @param element Cliente
   */
  /*onElementSaved(element: any){
  }

  onElementDeleted(){
  }*/

  ngOnInit() {
    this.loadDetailComponents();
    this.sub.add(
      this.dialogRef.backdropClick().subscribe((_) => {
        this.closeDialog();
      })
    );
    // this.sub.add(this.dialogRef.beforeClosed().subscribe(res => {
    //   this.closeDialog();
    //   return false;
    // }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  loadDetailComponents() {
    this.detailHost.clear();
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      this.data.detailComponent
    );
    this._detailComponentRef = this.detailHost.createComponent(factory);
    this.setupDetailComponent();
    this._detailComponentRef.changeDetectorRef.detectChanges();
  }

  setupDetailComponent() {
    let comp = this._detailComponentRef;
    if (comp && comp.instance) {
      if (this.data.meta) {
        for (let attribute of Object.keys(this.data.meta)) {
          comp.instance[attribute] = this.data.meta[attribute];
        }
      }
      if (this.data.element) {
        //element è null per esempio in caso di insert
        const elementId = comp.instance.idExtractor(this.data.element);
        if (this.data.loadRemoteData && comp.instance.loadData && elementId) {
          comp.instance.loadData(elementId);
        } else {
          comp.instance.element = this.data.element;
        }
      }
      //si aggiunge il riferimento a dialogRef nel detail (utile per es per chiudere il dialog direttamente dal detail)
      comp.instance.containerDialogRef = this.dialogRef;
    }
  }

  @HostListener("window:keyup.esc") onKeyUp() {
    console.log("keyup.esc detail-dialog:");
    this.closeDialog();
  }

  @HostListener("window:beforeunload", ["$event"]) unloadDialogHandler(
    event: Event
  ) {
    console.log("beforeunload detail-dialog:", event);
    event.returnValue = false;
  }

  get isOkBtnDisabled(): boolean {
    if (
      this.detailComponent.saving ||
      (!(this.detailComponent instanceof DetailReactiveComponent) &&
        !this.detailComponent.form.form.valid) ||
      (this.detailComponent instanceof DetailReactiveComponent &&
        !this.detailComponent.reactiveForm.valid)
    ) {
      return true;
    }
    return false;
  }
}
