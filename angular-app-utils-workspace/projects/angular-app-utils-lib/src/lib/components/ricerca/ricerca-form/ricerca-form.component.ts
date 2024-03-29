import { MatMenuTrigger } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserMessageService } from '../../../services/user-message.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { FilterField, FilterFieldType, Filtro, FiltroCampo } from '../ricerca.model';
import { RicercaFormAbstractComponent } from '../ricerca-form-abstract.component';
import { MatExpansionPanel } from '@angular/material/expansion';
import { RicercaFieldSelectComponent } from '../ricerca-field-select/ricerca-field-select.component';

/**
 * Component per la ricerca avanzata con utente id e sezione
 */
@Component({
  selector: 'aaul-ricerca-form',
  templateUrl: './ricerca-form.component.html',
  styleUrls: ['./ricerca-form.component.scss']
})
export class RicercaFormComponent extends RicercaFormAbstractComponent<FilterField, Filtro> {

  @ViewChild('fieldSelectApp') fieldSelectApp: RicercaFieldSelectComponent; // Accesso al component dove è presente la Mat-Select
  @ViewChild('menuTrigger') public trigger: MatMenuTrigger;


  FilterFieldType = FilterFieldType;


  @Input() sezione: string = '';
  @Input() userId: string | number;
  @Input() isSearching: boolean = false;

  /**
   * mostra i pulsanti di ricerca e salvataggio ricerche in alto
   */
  @Input() showActionButtonsAtTop: boolean = false;
  /**
   * mostra i pulsanti di ricerca e salvataggio ricerche in basso
   */
  @Input() showActionButtonsAtBottom: boolean = true;

  constructor(httpClient: HttpClient,
    userMessageService: UserMessageService,
    public dialog: MatDialog) {

    super(httpClient, userMessageService, dialog);
  }

  //da classe astratta
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
    if (!field.StringValue) {
      field.StringValue = '';
    }
    this.selectedFilters.push(field);
  }

  public updateFilterField(menuItemSelected: FilterField, fieldToUpdate: FilterField, menuTrigger: MatMenuTrigger) {
    try {
      menuTrigger.closeMenu();
    } catch (ex) {
      console.log(ex);
    }
    const indexToUpdate = this.selectedFilters.findIndex(el => el.UniqueId == fieldToUpdate.UniqueId);
    let oldValue = fieldToUpdate.StringValue;
    if (!oldValue) {
      oldValue = '';
    }else{
      oldValue = oldValue.split('=')[1];
    }
    const oldOperator = fieldToUpdate.ActualOperator;
    fieldToUpdate = {
      ...menuItemSelected,
      StringValue: oldValue,
      ActualOperator: oldOperator,
      UniqueId: menuItemSelected.Name + '_' + new Date().getTime().toString()
    } as FilterField;

    this.selectedFilters.splice(indexToUpdate, 1 , fieldToUpdate);
  }

  //da classe astratta
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

  //da classe astratta
  removeField(uniqueId: string) {
    this.selectedFilters = this.selectedFilters.filter(el => el.UniqueId != uniqueId);
  }

  //da classe astratta
  loadSavedFilterParams() {
    let params = super.loadSavedFilterParams();
    const utenteId = this.userId;
    return params.set('UtenteID', utenteId.toString()).set('Sezione', this.sezione);
  }

  //da classe astratta
  prepareSearchToBeSaved(nomeRicerca: string, campiRicerca: FilterField[]): any {
    return {
      Nome: nomeRicerca,
      Sezione: this.sezione,
      UtenteID: this.userId,
      FiltroCampi: campiRicerca.map(el => {
        return {
          Name: el.Name,
          Label: el.Label,
          StringValue: el.ActualValueString,
          DefaultOperator: el.ActualOperator,
          ChildrenReference: el.parentReference
        } as FiltroCampo
      })
    } as Filtro;
  }

  //da classe astratta
  onSavedSearchInserted(res: any) {
    this.savedFilters.push(res);
  }

  @ViewChild('mep') matExpansionPanel: MatExpansionPanel;

  //da classe astratta
  onSavedSearchClicked(filtro: Filtro) {
    if (filtro.FiltroCampi != null) {
      if (this.matExpansionPanel){
        this.matExpansionPanel.open();
      }
      this.selectedFilters = [];
      for (let i = 0; i < filtro.FiltroCampi.length; i++) {
        const campo = filtro.FiltroCampi[i];
        const item: FilterField = this.getItemMenu(campo.Name, campo.ChildrenReference);
        if (item) {
          item.Label = campo.Label;
          item.ActualOperator = campo.DefaultOperator;
          item.StringValue = campo.StringValue;
          item.parentReference = campo.ChildrenReference;
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
    return fields.find(el => el.Name == nomeCampo);
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

  onSavedSearchDeleted(res: any, idItem: any) {
    const i = this.savedFilters.findIndex(el => el.ID == idItem);
    this.savedFilters.splice(i, 1);
  }

  isOpened: boolean = false;

  get searchOnEnterPressed(): boolean{
    return this.isOpened;
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if(this.searchOnEnterPressed){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.search();
    }
  }

}
