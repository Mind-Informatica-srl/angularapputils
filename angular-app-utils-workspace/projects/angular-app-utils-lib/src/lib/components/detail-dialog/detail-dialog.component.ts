import { OnInit, Type, ViewChild, ViewContainerRef, Inject, ComponentFactoryResolver, ComponentRef, Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetailComponent } from '../detail/detail.component';

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
 */
export interface DetailDialogData<T> {

  detailComponent: Type<any>;//campo obbligatorio
  element?: T;
  loadRemoteData?: boolean;
  title: string,
  subTitle?: string,
  meta?: Object

}

/**
 * Permette di aprire un dialog con all'interno un DetailComponent
 */
@Component({
  selector: 'app-detail-dialog',
  templateUrl: './detail-dialog.component.html',
  styleUrls: ['./detail-dialog.component.scss']
})
export class DetailDialogComponent implements OnInit {

  _detailComponentRef: ComponentRef<any>;
  title: string = "Dettaglio selezionato";
  subTitle: string = null;
  
  //detailTemplate: TemplateRef<any>;

  get detailComponent(): DetailComponent<any, any>{
    try{
      return this._detailComponentRef.instance as any as DetailComponent<any, any>;
    }catch(ex){
      console.log(ex);      
      return null;
    }
  }

  //@ViewChild('detailHost') _detailComponent: TemplateRef<any>;

  //@ViewChild(AdDirective, {static: true}) adHost: AdDirective;
  @ViewChild('detailHost', {static: true, read: ViewContainerRef}) detailHost: ViewContainerRef;

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: DetailDialogData<any>, 
    protected componentFactoryResolver: ComponentFactoryResolver) {
      if(data.title){
        this.title = data.title
      }
      if(data.subTitle){
        this.subTitle = data.subTitle
      }
  }

  onNoClick(){
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
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
  }

  loadDetailComponents() {
    this.detailHost.clear();
    const factory = this.componentFactoryResolver.resolveComponentFactory(this.data.detailComponent);
    this._detailComponentRef = this.detailHost.createComponent(factory);
    this.setupDetailComponent();    
    this._detailComponentRef.changeDetectorRef.detectChanges();
  }

  setupDetailComponent(){
    let comp = this._detailComponentRef;
    if(comp && comp.instance){      
      if(this.data.meta){
        for (let attribute of Object.keys(this.data.meta)) {
          comp.instance[attribute] = this.data.meta[attribute];
        }
      }
      if(this.data.element){//element è null per esempio in caso di insert
        const elementId = comp.instance.idExtractor(this.data.element);
        if(this.data.loadRemoteData && comp.instance.loadData && elementId){
          comp.instance.loadData(elementId);
        } else {
          comp.instance.element = this.data.element;
        }
      }
      //si aggiunge il riferimento a dialogRef nel detail (utile per es per chiudere il dialog direttamente dal detail)
      comp.instance.containerDialogRef = this.dialogRef; 
    }
  }

}
