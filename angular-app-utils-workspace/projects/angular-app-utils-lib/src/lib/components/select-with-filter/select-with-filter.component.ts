import { Component, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { SimpleModel, mapSimpleModelList } from '../ricerca/ricerca.model';

export interface SelectWithFilterValue {

  value: string | number,
  custom: boolean
}

@Component({
  selector: 'aaul-select-with-filter',
  templateUrl: './select-with-filter.component.html',
  styleUrls: ['./select-with-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectWithFilterComponent),
      multi: true
    }
  ]
})
export class SelectWithFilterComponent implements ControlValueAccessor {

  @Input() enableCustomValue: boolean = false;

  @Input() inputName: string = new Date().getTime().toString();

  @Input() label: string = 'Opzioni';
  /**
   * stringa utilizzata per ricavare la descrizione da mostrare all'utente delle option della select di filteredList
   * 
   * di default è 'Titolo', 
   * 
   * altrimenti si può sovrascrivere passando in field l'attributo opzionale DescriptionField
   */
  @Input() descriptionField: string = 'Titolo';
  /**
  * stringa utilizzata per ricavare l'id delle option della select di filteredList
  * 
  * di default è 'ID', 
  * 
  * altrimenti si può sovrascrivere passando in field l'attributo opzionale IDField
  */
  @Input() idField: string = 'ID';
  /**
   * eventEmitter per notificare il cambiamento del valore del component
   */
  @Output() onChangeValue = new EventEmitter<SelectWithFilterValue>();
  protected _list: SimpleModel[] = [];
  /**
   * lista totale (utile per StaticSelect)
   * 
   * nel caso di una StaticSelect, va passato l'attributo opzionale 'list' in field
   */
  @Input() set options(values: any[]) {
    this._list = mapSimpleModelList(values);
    this.filteredList = this._list;
  }

  get list(): SimpleModel[] {
    return this._list;
  }

  filteredList: SimpleModel[] = [];
  searchFailed = false;
  searching = false;

  /**
   * se true, quando si seleziona un elemento dalla select, dopo l'event Emitter, si deseleziona la select
   */
  @Input() onSelectClear: boolean = false;

  private sub: Subscription = new Subscription();

  formGroup: FormGroup;
  get selectInput() { return this.formGroup.get('selectInput'); }

  constructor(
    private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      selectInput: ['', []],
    });
    this.sub.add(this.listSelectChange.subscribe((term: string) => {
      this.searching = true;
      this.searchFailed = false;
      this.filteredList = this.list.filter(el => el.Description.toLowerCase().includes(term.toLowerCase()));
      this.searching = false;
    }));
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
      if (value != null && value != '') {
        //si avvia ricerca se value è definito
        this.listSelectChange.emit(value);
      } else {
        //altrimenti si svuotano i risultati
        this.filteredList = this.list;
      }
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @ViewChild('searchInputRef') searchInputRef: MatInput;

  /**
   * quando si apre la select con la lista dei valori, si pone il focus sull'input per filtrarli
   * @param opened boolean true se la select è stata aperta
   */
  onSelectOpen(opened: boolean) {
    if (opened) {
      this.searchInputRef.focus();
    }
  }

  /**
     * MatSelect contenente il valore
     */
  @ViewChild('matSelect') matSelect: MatSelect;

  /**
    * è il valore che viene reso disponibile in ngModel quando si usa il componente
    */
  protected _value: string | number;

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.emitChanges();
  }

  onChange = (_: any) => { };

  onTouched = (_: any) => { };

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.matSelect.disabled = isDisabled;
  }

  /**
   * notifica il cambiamento di value
   */
  emitChanges() {
    this.onChange(this.value);
    this.onChangeValue.emit({ value: this.value, custom: false } as SelectWithFilterValue);
    if (this.onSelectClear) {
      this._value = undefined;
      this.matSelect.value = this.value;
      this.onChange(this.value);
    }
  }

  onSearchInputEnter(val: string) {
    if (this.enableCustomValue) {
      try {
        const valNumber = parseFloat(val);
        this.onChangeValue.emit({ value: valNumber, custom: true } as SelectWithFilterValue);
        this.searchInputRef.value = undefined;
        this.matSelect.close();
      } catch (ex) {
        console.log(ex);
      }
    }
  }

}
