import { TitleService } from './../../services/title.service';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { UserMessageService, MessageType } from '../../services/user-message.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GenericComponent } from '../generic-component/generic.component';
import { ApiActionsType } from './../../api-datasource/api-datasource';


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

  evaluateRouteParent: boolean = false; //da sovrascrivere a true se si vuole ricavare l'ID da route.parent
  closeDetailOnSave: boolean = true;//se true, chiude automaticamente il detail al salvataggio (se aperto in una modal)
  validateErrorMessage: string;
  reloadListOnSaveError: boolean = false;

  public get element(): T {
    return this._element;
  }

  get inserted(): boolean {
    return this.idExtractor(this.element) == null;
  }

  //Al salvataggio di un item, dice se notificare a tutte le tab aperte il cambiamento 
  protected onUpdateRefreshAllPages: boolean = true;
  /**
   * se subscribeRoute è false va passato element come input;
   * se subscribeRoute è true element viene caricato tramite apiDatasource nell'ngOnInit;
   */
  @Input() public set element(value: T) {
    this._element = value;
    this.onElementChanged();
  }

  openAlertModal(): void {
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
  containerDialogRef: MatDialogRef<any> = null;//ref del dialog in cui può essere contenuto il detail

  constructor(
    httpClient: HttpClient,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dataRefreshService: DataRefreshService,
    userMessageService: UserMessageService,
    protected location: Location,
    public dialog: MatDialog,
    authService: AuthenticationService<LoginInfo>,
    titleService: TitleService) {
    super(httpClient, userMessageService, authService, titleService);
  }

  ngOnInit(): void {
    if (this.subscribeRoute) {
      this.sub.add(this.route.params.subscribe(params => {
        const id = params["Id"];
        if (id == "new") {
          this.prepareForNewItem();
        } else {
          if (this.evaluateRouteParent) {
            const parentId = this.route.parent.snapshot.params["Id"];
            if (parentId == 'new') {
              this.prepareForNewItem();
            } else {
              this.loadData(parentId);
            }
          } else {
            this.loadData(id);
          }
        }
      }));
    } else {
      this.prepareForNewItem();
    }
  }

  private _showOnlyPreview: boolean = false;
  //indica se stiamo mostrando solo una preview del detail
  get showOnlyPreview(): boolean {
    return this._showOnlyPreview;
  }

  //se si vuole mostrare solo un anteprima, siamo del dettaglio di una grid per esempio; subscribeRoute quindi dovrà essere l'opposto
  @Input() set showOnlyPreview(val: boolean) {
    this._showOnlyPreview = val;
    this.subscribeRoute = !val;
  }

  prepareForNewItem(): void {
    if (this.element == null) {
      this.element = {} as T;
    } else {
      this.resetForm();
    }
  }

  loadData(id: number | string) {
    this.isLoadingResults = true;
    this.dataError = false;
    this.sub.add(this.apiDatasource.getElement(id).subscribe((data) => {
      this.onLoadedData(data);
    }, (error) => {
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
    this.isLoadingResults = false;
  }

  protected onElementChanged(): void {
    this.resetForm();
    this.updateTitle(this.descriptionExtractor(this.element));
  }

  save() {
    if (this.validate()) {
      this.saving = true;
      if (this.inserted) {
        this.sub.add(this.apiDatasource.insert(this.element).subscribe((data) => {
          console.log('elemento inserito');
          this.onItemSaved(data, ApiActionsType.AddAction);
          this.reload(data);
        }, (err) => {
          this.onSaveError(err);
        }));
      } else {
        this.sub.add(this.apiDatasource.update(this.element).subscribe((data) => {
          console.log('elemento salvato');
          this.onItemSaved(data, ApiActionsType.UpdateAction);
        }, (err) => {
          this.onSaveError(err, this.idExtractor(this.element));
          console.error('errore salvataggio elemento', err);
        }));
      }
    } else {
      this.userMessageService.message({
        errorMessage: this.validateErrorMessage,
        messageType: MessageType.Error
      })
    }
  }

  /**
   * prima di eseguire la delete, si chiede all'utente conferma dell'azione
   */
  delete() {
    if (this.isAuthorizedToDelete()) {
      let dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: this.deleteDialogTitle != null ? this.deleteDialogTitle : "Richiesta eliminazione",
          message: this.deleteDialogMessage != null ? this.deleteDialogMessage : "Vuoi eliminare l'elemento selezionato?",
          action: "DELETE",
          showNegativeButton: true
        }
      });
      this.sub.add(dialogRef.afterClosed().subscribe((result: boolean) => {
        console.log('Confirm dialog closed', result);
        if (result) {
          this.deleteAction();
        }
      }));
    } else {
      this.userMessageService.message({
        errorMessage: "Utente non autorizzato",
        messageType: MessageType.Error
      })
    }
  }

  isAuthorizedToDelete() {
    return this.isAuthorizedToModify();
  }

  protected deleteAction() {
    if (this.inserted) {
      //se non esiste id dell'elemento significa che stiamo eliminando un elemento appena generato, ma non salvato su server
      this.closeDetail();
    } else {
      const oldId = this.idExtractor(this.element);
      this.saving = true;
      this.sub.add(this.apiDatasource.delete(this.element).subscribe((data) => {
        console.log('elemento eliminato');
        this.onItemDeleted(oldId);
      }, (err) => {
        this.onSaveError(err, oldId);
      }));
    }
  }

  onItemDeleted(oldId: string | number) {
    if (this.dataRefreshService != null) {
      this.dataRefreshService.dataHasChange(this.LIST_NAME, ApiActionsType.DeleteAction, oldId, null, this.onUpdateRefreshAllPages);
    }
    this.closeDetail();
  }

  protected reload(data: T): void {
    if (this.subscribeRoute) {
      this.router.navigate(["../", this.idExtractor(data)], {
        relativeTo: this.route
      });
    } else {
      this.refreshElement(data);
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
    if (this.dataRefreshService != null) {
      this.dataRefreshService.dataHasChange(this.LIST_NAME, action, this.idExtractor(data), data, this.onUpdateRefreshAllPages);
    }
    if (this.closeDetailOnSave) {
      this.closeDetail();
    }
  }

  /**
   * chiamato quando viene sollevato un errore al salvataggio
   * se reloadListOnSaveError è 
   * @param err errore rilevato
   * @param id eventuale id del dettaglio che ha dato errore
   */
  protected onSaveError(err: any, id?: string | number): void {
    console.error('Errore salvataggio', err);
    this.saving = false;
    if (this.reloadListOnSaveError) {
      this.reloadList(id);
    }
  }

  protected resetForm() {
    if (this.form) {
      this.form.control.markAsPristine();
      if (this.isAuthorizedToModify() && !this.showOnlyPreview) {
        this.form.control.enable();
      } else {
        this.form.control.disable();
      }
    }
    this.saving = false;
    this.validateErrorMessage = null;
    this.dataError = false;
    this.isLoadingResults = false;
  }

  protected validate(): boolean {
    this.validateErrorMessage = null;
    let ret = this.isAuthorizedToModify();
    if (!ret) {
      this.validateErrorMessage = "Utente non autorizzato";
    }
    return ret;
  }

  closeDetail(): void {
    if (this.subscribeRoute) {
      const index = this.router.url.lastIndexOf("/");
      const path = this.router.url.substring(0, index);
      this.router.navigate([path]);
      //this.location.back();
    } else if (this.containerDialogRef) {
      this.containerDialogRef.close();
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  goToPreviousPage() {
    this.location.back();
  }

  //ricarica la lista legata al detail
  reloadList(id?: string | number, el?: T) {
    this.dataRefreshService.dataHasChange(this.LIST_NAME, ApiActionsType.UpdateAction, id, el, false);
  }

}
