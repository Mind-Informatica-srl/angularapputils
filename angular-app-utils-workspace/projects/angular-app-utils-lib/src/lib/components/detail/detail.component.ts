import { ApiActionsType } from './../../api-datasource/api-datasource';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OnInit, Input, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { GenericComponent } from '../generic-component/generic.component';
import { DataRefreshService } from '../../services/data-refresh.service';
import { UserMessageService } from '../../services/user-message.service';
import { ApiDatasource } from '../../api-datasource/api-datasource';
import { AuthenticationService } from '../../services/authentication.service';


export abstract class DetailComponent<T, LoginInfo> extends GenericComponent<T, LoginInfo> implements OnInit {

  //viewChild della form. Ci serve per avbilitare/disabilitare i bottoni di salvataggio (vedi onItemSaved)
  @ViewChild(NgForm, { static: true }) form: NgForm;
  //titolo della finestra modale che chiede conferma per la cancellazione di un elemento
  protected deleteDialogTitle: string;
  //messaggio della finestra modale che chiede conferma per la cancellazione di un elemento
  protected deleteDialogMessage: string;

  //attributo che viene settato a tru nel momento di un salvataggio/cancellazione
  saving: boolean = false;
  private _element: T = {} as T;
  
  evaualteRouteParent: boolean = false; //da sovrascrivere a true se si vuole ricavare l'ID da route.parent
  
  public get element(): T {
    return this._element;
  }

  get inserted(): boolean{
    return this.idExtractor(this.element) == null;
  }

  /**
   * se subscribeRoute è false va passato element come input;
   * se subscribeRoute è true element viene caricato tramite apiDatasource nell'ngOnInit;
   */
  @Input() public set element(value: T) {
    this._element = value;
    this.onElementChanged();
  }

  openAlertModal(): void{
    /*let dialogRef = this.dialog.open(ChangeElementDialogComponent, {
      width: '80%'      
    });
    this.sub.add(dialogRef.afterClosed().subscribe( (result: boolean) => {
      console.log('alert dialog closed', result);
      if(result){
        
      }
    })); */
    confirm("Abbandonare le modifiche non salvate?")
  }

  isLoadingResults: boolean = true;
  dataError: boolean = false;

  constructor(
    protected httpClient: HttpClient,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dataRefreshService: DataRefreshService<T>,
    protected userMessageService: UserMessageService,
    protected location: Location,
    public dialog: MatDialog,
    authService: AuthenticationService<LoginInfo>) {
      super(authService);
     }

  ngOnInit(): void {
    this.apiDatasource = new ApiDatasource(this.httpClient, this.apiDatasourcePath, this.userMessageService, this.idExtractor);
    if(this.subscribeRoute){
      this.sub.add(this.route.params.subscribe(params => {
        const id = params["Id"];
        if(id == "new"){
          this.prepareForNewItem();
        } else {
          if(this.evaualteRouteParent){
            this.loadData(this.route.parent.snapshot.params["Id"]);
          }else{
            this.loadData(id);
          }
        }
      }));
    }else if(this.element == null){
      this.element = {} as T;
    }
  }

  prepareForNewItem(): void {
    this.element = {} as T;
  }

  loadData(id: number) {
    this.isLoadingResults = true;
    this.dataError = false;
    this.sub.add(this.apiDatasource.getElement(id).subscribe((data) => {
      this.onLoadedData(data);
      this.isLoadingResults = false;
    },(error) => {
      this.onLoadingDataError(error);
    }));
  }

  protected onLoadingDataError(error: any) {
    console.error("DetailComponent: errore nel caricamento dati");
    console.error(error);
    this.isLoadingResults = false;
    this.dataError = true;
  }

  protected onLoadedData(data: T) {
    this.element = data;
  }
  
  protected onElementChanged(): void{
    this.resetForm();
  }

  save() {
    if(this.validate()){
      this.saving = true;
      if(this.idExtractor(this.element) == null){
        this.sub.add(this.apiDatasource.insert(this.element).subscribe((data) => {
          console.log('elemento inserito');
          this.onItemSaved(data, ApiActionsType.AddAction);
          if (this.subscribeRoute) {
            this.router.navigate(["../", this.idExtractor(data)], {
              relativeTo: this.route
            });
          } else {
            this.refreshElement(data);
          }
        }, (err) => {
          this.onSaveError(err);
          
        }));
      }else{
        this.sub.add(this.apiDatasource.update(this.element).subscribe((data) => {
          console.log('elemento salvato');
          this.onItemSaved(data, ApiActionsType.UpdateAction);
        }, (err) => {
          this.onSaveError(err);
          console.error('errore salvataggio elemento');
          console.error(err);
        }));
      }
    }
  }

  /**
   * prima di eseguire la delete, si chiede all'utente conferma dell'azione
   */
  delete() {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.deleteDialogTitle != null ? this.deleteDialogTitle : "Richiesta eliminazione",
        message: this.deleteDialogMessage != null ? this.deleteDialogMessage : "Vuoi eliminare l'elemento selezionato?",
        action: "DELETE",
        showNegativeButton: true
      }
    });
    this.sub.add(dialogRef.afterClosed().subscribe( (result: boolean) => {
      console.log('Confirm dialog closed', result);
      if(result){
        this.deleteAction();
      }
    }));     
  }

  protected deleteAction(){
    if(this.idExtractor(this.element) == null){
      //se non esiste id dell'elemento significa che stiamo eliminando un elemento appena generato, ma non salvato su server
      this.closeDetail();
    }else{
      this.saving = true;
      this.sub.add(this.apiDatasource.delete(this.element).subscribe((data) => {
        console.log('elemento eliminato');
        this.onItemSaved(data, ApiActionsType.DeleteAction);
        this.closeDetail();
        /*if (this.subscribeRoute) {
          this.router.navigate(["../"], {
            relativeTo: this.route
          });
        }*/
      }, (err) => {
        this.onSaveError(err)
      }));
    }
  }

  //si sovrascrivono gli attributi di element (chiamato dopo il metodo save)
  protected refreshElement(data: T): void {
    for (let attribut in data) {
      this.element[attribut] = data[attribut];
    }
  }

  protected onItemSaved(data: T, action: ApiActionsType): void {
    this.resetForm();
    if(this.dataRefreshService != null){
      this.dataRefreshService.dataHasChange(this.LIST_NAME, data, action);
    }
  }

  protected onSaveError(err: any): void {
    console.error('Errore salvataggio', err);
    this.saving = false;
  }

  protected resetForm(){
    if(this.form){
      this.form.control.markAsPristine();
      if(this.isAuthorizedToModify()){
        this.form.control.enable();
      }else{
        this.form.control.disable();
      }
    }
    this.saving = false;
  }

  protected validate(): boolean {
    return true;
  }

  closeDetail(): void{
    if (this.subscribeRoute) {
      const index = this.router.url.lastIndexOf("/");
      const path = this.router.url.substring(0, index);      
      this.router.navigate([path]);
      //this.location.back();
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

}