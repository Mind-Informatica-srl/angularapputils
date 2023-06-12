import { TitleService } from "./../../services/title.service";
import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { OnInit, Directive, Input } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";

import { AuthenticationService } from "../../services/authentication.service";
import { DataRefreshService } from "../../services/data-refresh.service";
import { UserMessageService } from "../../services/user-message.service";
import { FormGroup } from "@angular/forms";
import { DetailComponent } from "../detail/detail.component";

@Directive()
export abstract class DetailReactiveComponent<T, LoginInfo>
  extends DetailComponent<T, LoginInfo>
  implements OnInit
{
  reactiveForm?: FormGroup;

  abstract toFormGroup(data: T): FormGroup;

  setReactiveFormValues(data: T): void {
    this.reactiveForm = this.toFormGroup(data);
  }

  public get element(): T {
    return this.reactiveForm?.value;
  }

  @Input() public set element(value: T) {
    this.setReactiveFormValues(value);
    this.onElementChanged();
  }

  // /**
  //  * se subscribeRoute è false va passato element come input;
  //  * se subscribeRoute è true element viene caricato tramite apiDatasource nell'ngOnInit;
  //  */
  // @Input() public set element(value: T) {
  //   this.setReactiveFormValues(value);
  // }

  get inserted(): boolean {
    return this.idExtractor(this.element) == null;
  }

  constructor(
    httpClient: HttpClient,
    route: ActivatedRoute,
    router: Router,
    dataRefreshService: DataRefreshService,
    userMessageService: UserMessageService,
    location: Location,
    dialog: MatDialog,
    authService: AuthenticationService<LoginInfo>,
    titleService: TitleService
  ) {
    super(
      httpClient,
      route,
      router,
      dataRefreshService,
      userMessageService,
      location,
      dialog,
      authService,
      titleService
    );
  }

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
              const parentId = this.route.parent?.snapshot.params["Id"];
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

  createElement(): void {
    this.setReactiveFormValues({} as T);
  }

  protected onLoadedData(data: T) {
    this.refreshElement(data);
    this.isLoadingResults = false;
  }

  // initializeElement(data: T): void {
  //   this.refreshElement(data);
  // }

  /**
   * si sovrascrivono gli attributi di element (chiamato dopo il metodo save)
   */
  protected refreshElement(data: T): void {
    this.setReactiveFormValues(data);
    this.originalElement = this.element;
  }

  protected resetForm() {
    super.resetForm();
    if (this.reactiveForm) {
      this.reactiveForm.markAsPristine();
      if (this.isAuthorizedToModify() && !this.showOnlyPreview) {
        this.reactiveForm.enable();
      } else {
        this.reactiveForm.disable();
      }
    }
  }

  protected validate(): boolean {
    let res = super.validate();
    if (res && this.reactiveForm && !this.reactiveForm.valid) {
      // se esiste una form e non è valida
      this.validateErrorMessage = "Attenzione: campi non validi";
      res = false;
    }
    return res;
  }

  /**
   * Reimposta element a originalElement
   */
  annullaModifiche() {
    this.refreshElement(this.originalElement);
  }
}
