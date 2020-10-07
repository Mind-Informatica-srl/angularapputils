import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { ApiDatasource } from '../../../api-datasource/api-datasource';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserMessageService } from '../../../services/user-message.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { PromptDialogComponent, PromptDialogData } from '../../prompt-dialog/prompt-dialog.component';
import { FilterField, FilterFieldType, Filtro, FiltroCampo, RicercaFieldChange } from '../ricerca.model';
import { RicercaFormAbstractComponent } from '../ricerca-form-abstract.component';

/**
 * Component per la ricerca avanzata
 */
@Component({
  selector: 'aaul-ricerca-form',
  templateUrl: './ricerca-form.component.html',
  styleUrls: ['./ricerca-form.component.scss']
})
export class RicercaFormComponent extends RicercaFormAbstractComponent {

  /**
   * campi disponibili per la ricerca
   */
  @Input() fields: FilterField[] = [];

  /**
   * campi selezionati per la ricerca
   */
  @Input() selectedFilters: FilterField[] = [];

  @Output() onFilterChanged = new EventEmitter<string>();

  FilterFieldType = FilterFieldType;

  @ViewChild('menuTrigger') public menuTrigger: MatMenuTrigger;

  @Input() canSaveSearch: boolean = false;

  @Input() sezione: string = '';

  protected filtroDatasource: ApiDatasource<Filtro>;

  protected sub: Subscription = new Subscription();
  /**
   * stringa per interrogare il server per i criteri di ricerca salvati
   * se non è definito, non si instanzia filtroDatasource
   */
  @Input() set searchApiUrl(val: string) {
    if (val) {
      this.filtroDatasource = new ApiDatasource(this.httpClient, val, this.userMessageService);
      this.loadSavedFilters();
    }
  }
  /**
   * ricerche ottenute dal server. Definite se searchApiUrl è non null
   */
  savedFilters: Filtro[] = [];

  constructor(httpClient: HttpClient,
    userMessageService: UserMessageService,
    authService: AuthenticationService<any>,
    public dialog: MatDialog) {
    super(httpClient, userMessageService, authService, dialog);
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /**
   * aggiunge alla form un nuovo campo di ricerca tra quelli presenti in fields
   * @param item campo di ricerca
   */
  public addFilterField(item: FilterField) {
    try {
      this.menuTrigger.closeMenu();
    } catch (ex) {
      console.log(ex);
    }
    let field = {
      ...item,
      UniqueId: item.Name + '_' + new Date().getTime().toString()
    } as FilterField;
    this.selectedFilters.push(field);
  }

  /**
   * Svuota il filtro
   */
  clean() {
    this.selectedFilters = [];
  }

  /**
   * Avvia ricerca con i campi selezionati
   */
  search() {
    //console.log('search', this.selectedFilters);
    //const param = this.prepareQueryParams();
    //console.log('search param', param);
    this.onFilterChanged.emit('');
  }

  /**
   * Prepara la query per il filtro
   */
  prepareQueryParams(): string {
    let res = '';
    for (let i = 0; i < this.selectedFilters.length; i++) {
      const field = this.selectedFilters[i];
      const val = field.StringValue;
      if (val) {
        if (res != '') {
          res += '&';
        }
        res += val;
      }
    }
    return res;
  }

  onChangeValue(event: RicercaFieldChange) {
    //console.log(event);
  }

  /**
   * rimuove un singolo item di ricerca dalla form
   * @param uniqueId 
   */
  removeField(uniqueId: string) {
    this.selectedFilters = this.selectedFilters.filter(el => el.UniqueId != uniqueId);
  }

  loadSavedFilterParams() {
    const utenteId = this.authService.userId;
    return new HttpParams().set('UtenteID', utenteId.toString()).set('Sezione', this.sezione);
  }

  loadSavedFilters() {
    const params = this.loadSavedFilterParams();
    this.sub.add(this.filtroDatasource.getFilteredElements(params).subscribe((res: Filtro[]) => {
      if (res) {
        this.savedFilters = res;
      } else {
        this.savedFilters = [];
      }
    }));
  }

  onSalvaRicercaClicked(campiRicerca: FilterField[]) {
    this.salvaRicerca(campiRicerca);
  }

  /**
   * salva una ricerca su db
   * 
   * mostra una modal che chiede un nome per salvare il criterio di ricerca
   * invia la richiesta di insert al server
   * 
   * @param campiRicerca elenco dei campi da salvare
   * @param modalTitle titolo della modal
   * @param modalMessage messaggio della modal
   * @param modalInputName label dell'input della modal
   */
  salvaRicerca(campiRicerca: FilterField[], modalTitle: string = 'Salva ricerca', modalMessage: string = 'Inserisci un nome per la ricerca', modalInputName: string = 'Nome') {
    console.log(campiRicerca);
    const promptData: PromptDialogData = {
      title: modalTitle,
      message: modalMessage,
      inputLabel: modalInputName,
      showNegativeButton: true,
      inputRequired: true
    }
    let dialogRef = this.dialog.open(PromptDialogComponent, { data: promptData });
    this.sub.add(dialogRef.afterClosed().subscribe((nomeRicerca: string) => {
      if (nomeRicerca) {
        const ricerca = this.prepareSearchToBeSaved(nomeRicerca, campiRicerca);
        this.filtroDatasource.insert(ricerca).subscribe(res => {
          this.onSavedSearchInserted(res);
        });
      }
    }));
  }

  prepareSearchToBeSaved(nomeRicerca: string, campiRicerca: FilterField[]): any {
    return {
      Nome: nomeRicerca,
      Sezione: this.sezione,
      UtenteID: this.authService.userId,
      FiltroCampi: campiRicerca.map(el => {
        return {
          Name: el.Name,
          StringValue: el.ActualValueString,
          DefaultOperator: el.ActualOperator,
          ChildrenReference: el.parentReference
        } as FiltroCampo
      })
    } as Filtro;
  }

  onSavedSearchInserted(res: any) {
    this.savedFilters.push(res);
  }

  /**
   * metodo chiamato alla selezione di un filtro salvato.
   * recupera i singoli filtri cercando il filterFields e associa i valori di default
   * riempie la form di ricerca con quanto ottenuto
   * 
   * @param filtro filtro selezionato
   */
  onSavedSearchClicked(filtro: Filtro) {
    if (filtro.FiltroCampi != null) {
      for (let i = 0; i < filtro.FiltroCampi.length; i++) {
        const campo = filtro.FiltroCampi[i];
        const item: FilterField = this.getItemMenu(campo.Name, campo.ChildrenReference);
        if (item) {
          item.ActualOperator = campo.DefaultOperator;
          item.StringValue = campo.StringValue;
          this.selectedFilters = [];
          this.addFilterField(item);
        }
      }
    }
  }

  /**
   * metodo per ottenere il FilterField corrispondente a nomeCampo e childrenRefString
   * 
   * @param nomeCampo nome del campo da cercare in filterFields e children
   * @param childrenRefString stringa childrenRef per filtrare i risultati nei children
   * @param fields campi in cui cercare di default è filterFields
   */
  getItemMenu(nomeCampo: string, childrenRefString: string, fields: FilterField[] = this.fields): FilterField {
    if (childrenRefString != null && childrenRefString != '') {
      const index = childrenRefString.indexOf('.');
      let childRef: string;
      let nextChildrenRef: string;
      if (index > -1) {
        childRef = childrenRefString.substring(0, index);
        nextChildrenRef = childrenRefString.substring(index + 1);
      } else {
        childRef = childrenRefString;
        nextChildrenRef = null;
      }
      let item = fields.find(el => {
        return el.childrenReference == childRef;
      });
      if (item) {
        return this.getItemMenu(nomeCampo, nextChildrenRef, item.children);
      }
      return null;
    }
    return fields.find(el => el.Name == nomeCampo && el.childrenReference == childrenRefString);
  }

  onDeleteSearchClicked(filtro: Filtro) {
    this.deleteSavedSearch(filtro);
  }

  /**
   * metodo per cancellare una ricerca salvata
   * 
   * apre prima una modal per chiedere conferma della cancellazione
   * 
   * @param filtro filtro da cancellare
   * @param modalTitle titolo della modal
   * @param modalMessage messaggio della modal
   */
  deleteSavedSearch(filtro: Filtro, modalTitle: string = `Elimina Ricerca`, modalMessage: string = `<p>Si desidera eliminare la ricerca ${filtro.Nome}?</p>`) {
    let deleteDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: modalTitle,
        message: modalMessage,
        showNegativeButton: true
      }
    });
    this.sub.add(deleteDialog.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.filtroDatasource.delete(filtro).subscribe(res => {
          this.onSavedSearchDeleted(res, filtro.ID);
        });
      }
    }));
  }

  onSavedSearchDeleted(res: any, idItem) {
    const i = this.savedFilters.findIndex(el => el.ID == idItem);
    this.savedFilters.splice(i, 1);
  }

}
