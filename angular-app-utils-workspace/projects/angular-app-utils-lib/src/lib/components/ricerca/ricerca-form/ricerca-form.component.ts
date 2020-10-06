import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { FilterField, FilterFieldType, RicercaFieldChange } from '../ricerca.model';


/**
 * Component per la ricerca avanzata
 */
@Component({
  selector: 'aaul-ricerca-form',
  templateUrl: './ricerca-form.component.html',
  styleUrls: ['./ricerca-form.component.scss']
})
export class RicercaFormComponent implements OnInit {

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

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * aggiunge alla form un nuovo campo di ricerca tra quelli presenti in fields
   * @param item campo di ricerca
   */
  addFilterField(item: FilterField) {
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

}
