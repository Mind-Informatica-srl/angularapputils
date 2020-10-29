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

  /**
   * viewChild della form. Ci serve per avbilitare/disabilitare i bottoni di salvataggio (vedi onItemSaved)
   */
  @ViewChild(NgForm, { static: true }) form: NgForm;
  /**
   * titolo della finestra modale che chiede conferma per la cancellazione di un elemento
   */
  protected deleteDialogTitle: string;
  /**
   * messaggio della finestra modale che chiede conferma per la cancellazione di un elemento
   */
  protected deleteDialogMessage: string;

  /**
   * attributo che viene settato a tru nel momento di un salvataggio/cancellazione
   */
  saving: boolean = false;
  private _element: T = {} as T;

  /**
   * da sovrascrivere a true se si vuole ricavare l'ID da route.parent
   */
  evaluateRouteParent: boolean = false;
  /**
   * se true, chiude automaticamente il detail al salvataggio
   */
  closeDetailOnSave: boolean = false;
  validateErrorMessage: string;
  reloadListOnSaveError: boolean = false;
  /**
   * true se il component è caricato in una window/tab a parte
   */
  loadInWindow: boolean = false;

  public get element(): T {
    return this._element;
  }

  get inserted(): boolean {
    return this.idExtractor(this.element) == null;
  }

  /**
   * Al salvataggio di un item, dice se notificare a tutte le tab aperte il cambiamento 
   */
  protected onUpdateRefreshAllPages: boolean = true;
  /**
   * se subscribeRoute è false va passato element come input;
   * se subscribeRoute è true element viene caricato tramite apiDatasource nell'ngOnInit;
   */
  @Input() public set element(value: T) {
    this._element = value;
    this.onElementChanged();
  }

  isLoadingResults: boolean = true;
  dataError: boolean = false;
  /**
   * ref del dialog in cui può essere contenuto il detail
   */
  containerDialogRef: MatDialogRef<any> = null;

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
    this.setAttribute();
  }

  /**
   * Metodo chiamato nel costruttore per poter settare eventuali attributi
   */
  setAttribute() {

  }

  ngOnInit(): void {
    if (this.subscribeRoute) {
      this.sub.add(this.route.params.subscribe(params => {
        const id = params["Id"];
        if (id == "new") {
          this.prepareForNewItem();
          this.resetForm();
        } else {
          if (this.evaluateRouteParent) {
            const parentId = this.route.parent.snapshot.params["Id"];
            if (parentId == 'new') {
              this.prepareForNewItem();
              this.resetForm();
            } else {
              this.loadData(parentId);
            }
          } else {
            this.loadData(id);
          }
        }
      }));
    } else {
      this.prepareFormAndItem();
    }
  }

  private _showOnlyPreview: boolean = false;
  /**
   * indica se stiamo mostrando solo una preview del detail
   */
  get showOnlyPreview(): boolean {
    return this._showOnlyPreview;
  }

  /**
   * se si vuole mostrare solo un anteprima, siamo del dettaglio di una grid per esempio; subscribeRoute quindi dovrà essere l'opposto
   */
  @Input() set showOnlyPreview(val: boolean) {
    this._showOnlyPreview = val;
    this.subscribeRoute = !val;
  }

  prepareFormAndItem() {
    if (this.element == null || this.idExtractor(this.element) == null) {
      this.prepareForNewItem();
    }
    this.resetForm();
  }

  prepareForNewItem(): void {
    this.element = {} as T;
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
    this.originalElement = this.element;
    this.updateTitle(this.descriptionExtractor(this.element));
  }

  save() {
    if (this.validate()) {
      this.saving = true;
      if (this.inserted) {
        this.sub.add(this.apiDatasource.insert(this.element).subscribe((data) => {
          console.log('elemento inserito');
          this.onItemSaved(data, ApiActionsType.AddAction);
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

  saveAndClose() {
    this.closeDetailOnSave = true;
    this.save();
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
      this.originalElement = null;
      this.closeDetail(true);
    } else {
      const oldId = this.idExtractor(this.element);
      this.saving = true;
      this.sub.add(this.apiDatasource.delete(this.element).subscribe((data) => {
        console.log('elemento eliminato');
        this.originalElement = null;
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
    this.closeDetail(true);
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

  /**
   * si sovrascrivono gli attributi di element (chiamato dopo il metodo save)
   */
  protected refreshElement(data: T): void {
    for (let attribut in data) {
      this.element[attribut] = data[attribut];
    }
    this.originalElement = this.element;
  }

  protected onItemSaved(data: T, action: ApiActionsType): void {
    this.resetForm();
    if (this.dataRefreshService != null) {
      this.dataRefreshService.dataHasChange(this.LIST_NAME, action, this.idExtractor(data), data, this.onUpdateRefreshAllPages);
    }
    if (action == ApiActionsType.AddAction) {
      this.reload(data);
    } else if (action == ApiActionsType.UpdateAction) {
      this.refreshElement(data);
    }
    if (this.closeDetailOnSave) {
      this.closeDetail(true);
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

  canCloseDetail(): Promise<boolean> {

    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.deleteDialogTitle != null ? this.deleteDialogTitle : "Attenzione",
        message: this.deleteDialogMessage != null ? this.deleteDialogMessage : "Ci sono delle modifiche non salvate.\nSicuri di volerle abbandonare?",
        action: MessageType.Warning,
        showNegativeButton: true
      }
    });
    return dialogRef.afterClosed().toPromise();

  }

  protected forceCloseWindow: boolean = false;

  /**
   * metodo chiamato per chiudere il detail
   * si resta in attesa della risposta dell'utente qualora ci sia la form con dati modificati
   * @param forceClose se true, non chiede permesso per chiudere e forza la chiusura del detail
   */
  async closeDetail(forceClose: boolean = false) {
    if (!forceClose && this.isElementChanged) {
      let res = await this.canCloseDetail();
      if (!res) {
        return;
      }
    }
    this.forceCloseWindow = forceClose;
    this.closeDetailAction();
  }

  closeDetailAction() {
    if (this.loadInWindow) {
      open(window.location.href, '_self').close();
    } else if (this.subscribeRoute) {
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

  /**
   * ricarica la lista legata al detail
   */
  reloadList(id?: string | number, el?: T) {
    this.dataRefreshService.dataHasChange(this.LIST_NAME, ApiActionsType.UpdateAction, id, el, false);
  }

  get isElementChanged(): boolean {
    const keys = Object.keys(this.element);
    for (let i = 0; i < keys.length; i++) {
      let res = this.isElementPropertyChanged(keys[i]);
      if (res) {
        console.log('isElementChanged', keys[i]);
        return true;
      }
    }
    return false;
  }

  /**
   * elemento di "backup" per confronare le modifiche effettuate prima di un eventuale salvataggio
   */
  protected _originalElement: T;

  /**
   * ritorna true se la proprietà passata ha valore diverso in element e _originalElement
   * @param prop proprietà da confrontare
   */
  isElementPropertyChanged(prop: string): boolean {
    return this.originalElement[prop] !== this.element[prop];
  }

  get originalElement(): T {
    if (!this._originalElement) {
      this._originalElement = {} as T;
    }
    return this._originalElement;
  }

  /**
   *  Copia in _originalElement i valori di obj
   */
  set originalElement(obj: T) {
    this._originalElement = Object.assign({}, obj);
  }

  /**
   * Serve eventualmente per impedire che si chiuda il detail contenuto in una window se non si è salvato
   * Chiamare questo metodo tramite un HostListener
   * se this.forceCloseWindow è true, chiude forzatamente la window
   * 
   * Esempio:
   * @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
   * 
   *   this.unloadDetailHandler(event);
   * 
   * }
   * 
   * @param event event passato dal HostListener
   */
  unloadDetailHandler(event: Event) {
    if (!this.forceCloseWindow && this.isElementChanged) {
      event.returnValue = false;//se si vuole mostrare all'utente il messaggio del browser che chiede conferma per chiudere la pagina
    }
  }

  /**
   * Reimposta element a originalElement
   */
  annullaModifiche() {
    this.element = this.originalElement
  }

}
