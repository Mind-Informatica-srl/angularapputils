import { ConfirmDialogData } from "./../confirm-dialog/confirm-dialog.component";
import { TitleService } from "./../../services/title.service";
import { Location } from "@angular/common";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Input, OnInit, ViewChild, Directive } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";

import { AuthenticationService } from "../../services/authentication.service";
import { DataRefreshService } from "../../services/data-refresh.service";
import {
  UserMessageService,
  MessageType,
} from "../../services/user-message.service";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { GenericComponent } from "../generic-component/generic.component";
import { ApiActionsType } from "./../../api-datasource/api-datasource";
import { HostListener } from "@angular/core";

@Directive()
export abstract class DetailComponent<T, LoginInfo>
  extends GenericComponent<T, LoginInfo>
  implements OnInit
{
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

  protected saveOnEnterPressed: boolean = false;

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
    titleService: TitleService
  ) {
    super(httpClient, userMessageService, authService, titleService);
    this.setAttribute();
  }

  /**
   * Metodo chiamato nel costruttore per poter settare eventuali attributi
   */
  setAttribute() {}

  ngOnInit(): void {
    if (this.subscribeRoute) {
      this.sub.add(
        this.route.params.subscribe((params) => {
          const id = params["Id"];
          if (id == "new") {
            this.createElementIfNotExists();
            this.prepareForNewItem();
            this.resetForm();
          } else {
            if (this.evaluateRouteParent) {
              const parentId = this.route.parent.snapshot.params["Id"];
              if (parentId == "new") {
                this.createElementIfNotExists();
                this.prepareForNewItem();
                this.resetForm();
              } else {
                this.loadData(parentId);
              }
            } else {
              this.loadData(id);
            }
          }
        })
      );
    } else {
      this.createElementIfNotExists();
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

  /**
   * prepara element (in caso di inserimento) e la form
   */
  prepareFormAndItem() {
    if (this.element == null || this.inserted) {
      this.prepareForNewItem();
    }
    this.resetForm();
  }

  /**
   * permette di preimpostare dei valori di default.
   * Chiamato nell'ngOnInit quando si crea un nuovo elemento
   */
  prepareForNewItem(): void {}

  /**
   * instanzia element se è null
   * Chiamato nell'ngOnInit
   */
  createElementIfNotExists(): void {
    if (this.createElementOnInit) {
      this.createElement();
    }
  }

  get createElementOnInit(): boolean {
    return this.element == null || this.subscribeRoute;
  }

  createElement(): void {
    this.element = {} as T;
  }

  loadData(id: number | string) {
    this.isLoadingResults = true;
    this.dataError = false;
    this.sub.add(
      this.apiDatasource.getElement(id).subscribe(
        (data) => {
          this.onLoadedData(data);
        },
        (error) => {
          this.onLoadingDataError(error);
        }
      )
    );
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

  /**
   * eventualmente da sovrascrivere per aggiungere HttpParams
   * alla request di insert
   */
  protected get insertHttpParams(): HttpParams | undefined {
    return;
  }

  /**
   * eventualmente da sovrascrivere per aggiungere HttpParams
   * alla request di update
   */
  protected get updateHttpParams(): HttpParams | undefined {
    return;
  }

  /**
   * eventualmente da sovrascrivere per aggiungere HttpParams
   * alla request di delete
   */
  protected get deleteHttpParams(): HttpParams | undefined {
    return;
  }

  save() {
    this.prepareElementToSave();
    if (this.validate()) {
      this.saving = true;
      if (this.inserted) {
        this.sub.add(
          this.apiDatasource
            .insert(this.element, this.insertHttpParams)
            .subscribe(
              (data) => {
                console.log("elemento inserito");
                this.onItemSaved(data, ApiActionsType.AddAction);
              },
              (err) => {
                this.onSaveError(err);
              }
            )
        );
      } else {
        this.sub.add(
          this.apiDatasource
            .update(this.element, this.updateHttpParams)
            .subscribe(
              (data) => {
                console.log("elemento salvato");
                this.onItemSaved(data, ApiActionsType.UpdateAction);
              },
              (err) => {
                this.onSaveError(err, this.idExtractor(this.element));
                console.error("errore salvataggio elemento", err);
              }
            )
        );
      }
    } else {
      this.userMessageService.message({
        errorMessage: this.validateErrorMessage,
        messageType: MessageType.Error,
      });
    }
  }

  saveAndClose() {
    this.closeDetailOnSave = true;
    this.save();
  }

  /**
   * chiamato prima del salvataggio e del validate
   * Permette di fare operazioni un attimo prima della validazione e del salvataggio
   */
  protected prepareElementToSave(): void {}

  /**
   * prima di eseguire la delete, si chiede all'utente conferma dell'azione
   */
  delete() {
    if (this.isAuthorizedToDelete()) {
      let dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title:
            this.deleteDialogTitle != null
              ? this.deleteDialogTitle
              : "Richiesta eliminazione",
          message:
            this.deleteDialogMessage != null
              ? this.deleteDialogMessage
              : "Vuoi eliminare l'elemento selezionato?",
          action: "DELETE",
          showNegativeButton: true,
        },
      });
      this.sub.add(
        dialogRef.afterClosed().subscribe((result: boolean) => {
          console.log("Confirm dialog closed", result);
          if (result) {
            this.deleteAction();
          }
        })
      );
    } else {
      this.userMessageService.message({
        errorMessage: "Utente non autorizzato",
        messageType: MessageType.Error,
      });
    }
  }

  isAuthorizedToModify() {
    return super.isAuthorizedToModify() && !this.showOnlyPreview;
  }

  isAuthorizedToDelete() {
    return this.isAuthorizedToModify();
  }

  protected deleteAction() {
    if (this.inserted) {
      //se non esiste id dell'elemento significa che stiamo eliminando un elemento appena generato, ma non salvato su server
      this.originalElement = null;
      this.closeDetail(true);
      this.onItemDeleted(null);
    } else {
      const oldId = this.idExtractor(this.element);
      this.saving = true;
      this.sub.add(
        this.apiDatasource
          .delete(this.element, this.deleteHttpParams)
          .subscribe(
            (data) => {
              console.log("elemento eliminato");
              this.originalElement = null;
              this.onItemDeleted(oldId);
            },
            (err) => {
              this.onSaveError(err, oldId);
            }
          )
      );
    }
  }

  onItemDeleted(oldId: string | number) {
    if (this.dataRefreshService != null) {
      this.dataRefreshService.dataHasChange(
        this.LIST_NAME,
        ApiActionsType.DeleteAction,
        oldId,
        null,
        this.onUpdateRefreshAllPages
      );
    }
    this.closeDetail(true);
  }

  protected reload(data: T): void {
    if (this.subscribeRoute) {
      if (this.evaluateRouteParent) {
        this.router.navigate(["../../", this.idExtractor(data)], {
          relativeTo: this.route,
        });
      } else {
        this.router.navigate(["../", this.idExtractor(data)], {
          relativeTo: this.route,
        });
      }
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

  goToNextDetail: boolean = false;

  saveAndContinue() {
    this.goToNextDetail = true;
    this.save();
  }

  protected askNextDetail(
    oldId: any,
    oldElement: any,
    action: ApiActionsType = ApiActionsType.UpdateAction
  ) {
    this.dataRefreshService.askForNextDetail(
      this.LIST_NAME,
      action,
      oldId,
      oldElement,
      this.loadInWindow
    );
    this.closeDetailOnSave = true;
  }

  protected onItemSaved(data: T, action: ApiActionsType): void {
    this.resetForm();
    if (this.dataRefreshService != null) {
      this.callDataRefreshService(data, action);
      if (this.goToNextDetail) {
        this.askNextDetail(this.idExtractor(data), data, action);
        this.closeDetailOnSave = true;
      }
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

  callDataRefreshService(data: T, action: ApiActionsType) {
    this.dataRefreshService.dataHasChange(
      this.LIST_NAME,
      action,
      this.idExtractor(data),
      data,
      this.onUpdateRefreshAllPages
    );
  }

  /**
   * chiamato quando viene sollevato un errore al salvataggio
   * se reloadListOnSaveError è
   * @param err errore rilevato
   * @param id eventuale id del dettaglio che ha dato errore
   */
  protected onSaveError(err: any, id?: string | number): void {
    console.error("Errore salvataggio", err);
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
    } else if (this.form && !this.form.valid) {
      // se esiste una form e non è valida
      this.validateErrorMessage = "Attenzione: campi non validi";
      ret = false;
    }
    return ret;
  }

  get isValid(): boolean {
    return this.validate();
  }

  canCloseDetail(): Promise<boolean> {
    let msg: string;
    if (this.containerDialogRef != null && !this.isValid) {
      msg = this.validateErrorMessage;
    } else {
      msg =
        "Ci sono delle modifiche non salvate.\nSicuri di volerle abbandonare?";
    }
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Attenzione",
        message: msg,
        action: MessageType.Warning,
        showNegativeButton: true,
      } as ConfirmDialogData,
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
      if (this.isAuthorizedToModify()) {
        //se non è abilitata la modifica, non ha senso chiamare canCloseDetail
        let res = await this.canCloseDetail();
        if (!res) {
          return;
        }
      }
      forceClose = true;
    }
    this.forceCloseWindow = forceClose;
    this.closeDetailAction();
  }

  closeDetailAction() {
    if (this.loadInWindow) {
      open(window.location.href, "_self").close();
    } else if (this.subscribeRoute) {
      const index = this.router.url.lastIndexOf("/");
      const path = this.router.url.substring(0, index);
      this.router.navigate([path]);
      //this.location.back();
    } else if (this.containerDialogRef) {
      this.containerDialogRef.close(this.element);
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData["animation"]
    );
  }

  goToPreviousPage() {
    this.location.back();
  }

  /**
   * ricarica la lista legata al detail
   */
  reloadList(id?: string | number, el?: T) {
    this.dataRefreshService.dataHasChange(
      this.LIST_NAME,
      ApiActionsType.UpdateAction,
      id,
      el,
      false
    );
  }

  get isElementChanged(): boolean {
    return DetailComponent.isObjectChanged(this.originalElement, this.element);
  }

  /**
   * Restituisce false se original e obj hanno stessi valori
   *
   * @param original any elemento originario
   * @param obj any nuovo elemento da confrontare con original
   * @returns boolean
   */
  static isObjectChanged(original: any, obj: any): boolean {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const prop = keys[i];
      let res = DetailComponent.isElementPropertyChanged(
        original[prop],
        obj[prop]
      );
      if (res) {
        console.log("isElementChanged", keys[i]);
        return true;
      }
    }
    return false;
  }

  /**
   * ritorna true se la proprietà passata ha valore diverso in element e _originalElement
   * @param prop proprietà da confrontare
   */
  static isElementPropertyChanged(originalValue: any, newValue: any): boolean {
    if (
      (originalValue == null && newValue != null) ||
      (originalValue != null && newValue == null)
    ) {
      return true;
    }
    if (typeof newValue === "object" && newValue != null) {
      if (!Array.isArray(newValue)) {
        // se non è un array, si richiama isObjectChanged
        return DetailComponent.isObjectChanged(originalValue, newValue);
      } else {
        // se è un array, prima si guarda se newValue e originalValue hanno stessa lunghezza
        if (
          !Array.isArray(originalValue) ||
          originalValue.length != newValue.length
        ) {
          return true;
        }
        // si cicla sugli elementi dell'array di newValue
        for (let i = 0; i < newValue.length; i++) {
          const el = newValue[i];
          const oldEl = originalValue[i];
          if (oldEl != null) {
            const res = DetailComponent.isObjectChanged(oldEl, el);
            if (res) {
              return res;
            }
          }
        }
        return false;
      }
    } else {
      return originalValue !== newValue;
    }
  }

  // protected isObjectChanged(obj: any): boolean {
  //   return DetailComponent.isObjectChangedFromOriginal(this.originalElement, obj);
  // }

  /**
   * elemento di "backup" per confronare le modifiche effettuate prima di un eventuale salvataggio
   */
  protected _originalElement: T;

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
      event.returnValue = false; //se si vuole mostrare all'utente il messaggio del browser che chiede conferma per chiudere la pagina
    }
  }

  /**
   * Reimposta element a originalElement
   */
  annullaModifiche() {
    this.element = this.originalElement;
  }

  @HostListener("document:keydown.enter", ["$event"]) onEnter(
    event: KeyboardEvent
  ) {
    if (this.saveOnEnterPressed && this.isAuthorizedToModify()) {
      try {
        (event.target as HTMLInputElement).blur();
      } catch (ex) {
        console.log(ex);
      }
      setTimeout(() => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.save();
      }, 100);
    }
  }
}
