import { FilterFieldType } from './../ricerca.model';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, forwardRef, OnDestroy, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { RicercaFieldAbstractComponent } from '../ricerca-field-abstract.component';
import { SimpleModel } from '../ricerca.model';
import { MatInput } from '@angular/material/input';
import { UserMessageService } from '../../../services/user-message.service';
import { ApiDatasource } from '../../../api-datasource/api-datasource';
import { MatSelect } from '@angular/material/select';


@Component({
  selector: 'aaul-ricerca-field-select',
  templateUrl: './ricerca-field-select.component.html',
  styleUrls: ['./ricerca-field-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RicercaFieldSelectComponent),
      multi: true
    }
  ]
})
export class RicercaFieldSelectComponent extends RicercaFieldAbstractComponent implements OnDestroy {
  /**
   * stringa utilizzata per ricavare la descrizione da mostrare all'utente delle option della select di filteredList
   *
   * di default è 'Titolo',
   *
   * altrimenti si può sovrascrivere passando in field l'attributo opzionale DescriptionField
   */
  descriptionField: string;
  /**
  * stringa utilizzata per ricavare l'id delle option della select di filteredList
  *
  * di default è 'ID',
  *
  * altrimenti si può sovrascrivere passando in field l'attributo opzionale IDField
  */
  idField: string;

  @ViewChild('selectField',{static: true}) public selectField: ElementRef<MatSelect>;

  constructor(protected httpClient: HttpClient, protected userMessageService: UserMessageService) {
    super();
  }

  /**
   * operatori per SimpleModel con id stringa
   */
  private _operatoriString = [
    {
      Label: 'uguale',
      Value: 'equal'
    },
    {
      Label: 'diverso',
      Value: 'notequal'
    },
    {
      Label: 'definito',
      Value: 'isnotnull'
    },
    {
      Label: 'non definito',
      Value: 'isnull'
    },
  ];

  /**
   * Operatori per SimpleModel con id numerico
   */
  private _operatoriNumber = [
    {
      Label: 'uguale',
      Value: 'equalnumber'
    },
    {
      Label: 'diverso',
      Value: 'notequalnumber'
    },
    {
      Label: 'definito',
      Value: 'isnotnull'
    },
    {
      Label: 'non definito',
      Value: 'isnull'
    },
  ];

  /**
   * se this.field.StringValue ha valore diverso da null al momento dell'inizializzazione,
   * si sovrascrive con this._operatoriString
   */
  operatori = this._operatoriNumber;
  protected _list: SimpleModel[] = [];
  /**
   * lista totale (utile per StaticSelect)
   *
   * nel caso di una StaticSelect, va passato l'attributo opzionale 'list' in field
   */
  set list(val: SimpleModel[]) {
    this._list = val;
    this.filteredList = val;
  }

  get list(): SimpleModel[] {
    return this._list;
  }
  /**
   * lista filtrata in base all'input di filtro sopra la select
   */
  filteredList: SimpleModel[] = [];
  searchFailed = false;
  searching = false;

  private sub: Subscription = new Subscription();

  ngOnInit() {
    super.ngOnInit();
    if (this.field.Type == FilterFieldType.DynamicSelect || this.field.Type == FilterFieldType.DynamicSelectNumber) {
      if (!this.field.ApiUrl) {
        console.error('RicercaFieldSelectComponent: ApiUrl non definito');
      }
      const listDatasource = new ApiDatasource(this.httpClient, this.field.ApiUrl, this.userMessageService);
      this.sub.add(this.listSelectChange.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => (this.searching = true)),
        switchMap((term: string) => {
          return listDatasource
            .getFilteredElements(new HttpParams().set(this.descriptionField, term))
            .toPromise()
            .then(
              (list: any[]) => {
                this.searchFailed = false;
                //si mappano i risultati in modo che siano di tipo SimpleModel
                return this.mapList(list);
              },
              error => {
                console.log(error);
                this.searching = false;
                this.searchFailed = true;
                return [] as SimpleModel[];
              }
            );
        }),
        tap(() => (this.searching = false))
      ).subscribe(res => {
        this.filteredList = res;
      }));
      if (this.fieldSelectValue) {
        //se è già selezionato un valore di default, si fa getOne e si mette la response in filteredList
        this.sub.add(listDatasource.getElement(this.fieldSelectValue).subscribe(res => {
          if (res) {
            this.filteredList = [];
            this.filteredList.push(this.mapElement(res));
          }
        }));
      }
    } else if (this.field.Type == FilterFieldType.StaticSelect || this.field.Type == FilterFieldType.StaticSelectNumber) {
      //caso StaticSelect
      if (!this.field.list) {
        //si valuta se c'è ApiUrl: in tal caso si caricano i dati dal server subito all'inizio
        if (this.field.ApiUrl) {
          const listDatasource = new ApiDatasource(this.httpClient, this.field.ApiUrl, this.userMessageService);
          this.searching = true;
          this.searchFailed = false;
          this.sub.add(listDatasource.getElements().subscribe((res: any[]) => {
            this.searching = false;
            this.list = this.mapList(res);
          }, err => {
            console.error(err);
            this.searching = false;
            this.searchFailed = true;
          }));
        } else {
          //altrimenti si solleva errore
          throw new Error('RicercaFieldSelectComponent: list e ApiUrl non definiti');
        }
      } else {
        this.list = this.mapList(this.field.list);
      }
      this.sub.add(this.listSelectChange.subscribe((term: string) => {
        this.searching = true;
        this.searchFailed = false;
        this.filteredList = this.list.filter(el => el.Description.toLowerCase().includes(term.toLowerCase()));
        this.searching = false;
      }));
    }
  }

  /**
   * si mappano i risultati in modo che siano di tipo SimpleModel
   * @param l lista da convertire in SimpleList
   */
  mapList(l: any[]): SimpleModel[] {
    return l.map(el => this.mapElement(el));
  }

  mapElement(el: any): SimpleModel {
    let valueId: string;
    if (this.idField.includes('#')) {
      const ids = this.idField.split('#');
      for (let i = 0; i < ids.length; i++) {
        const idVal = ids[i];
        if (valueId) {
          valueId += "#";
        } else {
          valueId = "";
        }
        valueId += el[idVal];
      }
    } else {
      valueId = el[this.idField];
    }
    return {
      ID: valueId,
      Description: el[this.descriptionField]
    } as SimpleModel
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get defaultOperatore(): string {
    if(this.field.Type == FilterFieldType.DynamicSelectNumber || this.field.Type == FilterFieldType.StaticSelectNumber){
      return 'equalnumber';
    }
    return 'equal';
  }

  onFieldSetted() {
    if (this.field.Type == FilterFieldType.DynamicSelectNumber || this.field.Type == FilterFieldType.StaticSelectNumber) {
      if (this.field.StringValue != null && this.field.StringValue != '') {
        try {
          this.fieldSelectValue = parseFloat(this.field.StringValue)
        } catch (ex) {
          console.error(ex);
        }
      }
      this.setValidOperator(this.field.ActualOperator);
      // this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator : this.defaultOperatore;
      if (this.selectedOperatore == 'isnull' || this.selectedOperatore == 'isnotnull') {
        this.hideValueInput = true;
      }
    } else {
      if (this.field.StringValue != null && this.field.StringValue != '') {
        this.fieldSelectValue = parseInt(this.field.StringValue);
      }
      this.operatori = this._operatoriString;
      this.setValidOperator(this.field.ActualOperator);
      // this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator : this.defaultOperatore;
      if (this.selectedOperatore == 'isnull' || this.selectedOperatore == 'isnotnull') {
        this.hideValueInput = true;
      }
    }
    this.descriptionField = this.field.DescriptionField ? this.field.DescriptionField : 'Description';
    this.idField = this.field.IDField ? this.field.IDField : 'ID';
  }

  /**
   * valore dell'input valore in number
   */
  protected _fieldSelectValue: number | string;

  get fieldSelectValue(): number | string {
    return this._fieldSelectValue;
  }

  set fieldSelectValue(val: number | string) {
    this._fieldSelectValue = val;
    this.fieldStringValue = this.fieldSelectValue != null ? this.fieldSelectValue.toString() : '';
  }

  private _listSelectFilterValue: string;
  private listSelectChange = new EventEmitter<string>();

  /**
   * Chiamato quando si scrive qualcosa nell'input per filtrare la select dei valori
   * @param value stringa valore inserito dall'utente
   */
  onSearchChange(value: string) {
    const valueChanged = value !== this._listSelectFilterValue;
    if (valueChanged) {
      this._listSelectFilterValue = value;
      if ((value != null && value != '') || (this.field.Type != FilterFieldType.DynamicSelect && this.field.Type != FilterFieldType.DynamicSelectNumber)) {
        //si avvia ricerca se value è definito, oppure se abbiamo il caso di una select statica
        this.listSelectChange.emit(value);
      } else {
        //altrimenti si svuotano i risultati (nel caso di una select statica qui non si arriva)
        this.filteredList = [];
      }
    }
  }

  @ViewChild('searchInputRef') searchInputRef: MatInput;

  /**
   * quando si apre la select con la lista dei valori, si pone il focus sull'input per filtrarli
   * @param opened bollean true se la select è stata aperta
   */
  onSelectOpen(opened: boolean) {
    if (opened) {
      this.searchInputRef.focus();
    }
  }
}
