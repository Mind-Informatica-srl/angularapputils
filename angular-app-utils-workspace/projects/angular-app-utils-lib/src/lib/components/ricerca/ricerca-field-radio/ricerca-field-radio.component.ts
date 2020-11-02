import { FilterFieldType, SimpleModel } from './../ricerca.model';
import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { RicercaFieldAbstractComponent } from '../ricerca-field-abstract.component';

@Component({
  selector: 'aaul-ricerca-field-radio',
  templateUrl: './ricerca-field-radio.component.html',
  styleUrls: ['./ricerca-field-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RicercaFieldRadioComponent),
      multi: true
    }
  ]
})
export class RicercaFieldRadioComponent extends RicercaFieldAbstractComponent {

  /**
   * in questo caso gli operatori non servono. Si imposta in ngOnInit direttamente selectedOperatore
   */
  operatori = [];

  /**
   * lista delle opzioni del radio 
   * va passato l'attributo 'list' in field
   */
  list: SimpleModel[] = [];
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

  onFieldSetted() {
    super.onFieldSetted();
    this.descriptionField = this.field.DescriptionField ? this.field.DescriptionField : 'Description';
    this.idField = this.field.IDField ? this.field.IDField : 'ID';
    switch (this.field.Type) {
      case FilterFieldType.RadioNumber:
        this.initializeList();
        this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator : 'equalnumber';
        if (this.selectedOperatore == 'isnull' || this.selectedOperatore == 'isnotnull') {
          this.hideValueInput = true;
        }
        this.fieldRadioValue = (this.field.StringValue != null && this.field.StringValue != '') ? parseFloat(this.field.StringValue) : 0;
        break;
      case FilterFieldType.RadioBoolean:
        this.setBooleanFields();
        this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator : 'equalboolean';
        if (this.selectedOperatore == 'isnull' || this.selectedOperatore == 'isnotnull') {
          this.hideValueInput = true;
        }
        this.fieldRadioValue = (this.field.StringValue != null && this.field.StringValue != '') ? this.field.StringValue : 'true';
        break;
      default:
        this.initializeList();
        this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator : 'equal';
        if (this.selectedOperatore == 'isnull' || this.selectedOperatore == 'isnotnull') {
          this.hideValueInput = true;
        }
        this.fieldRadioValue = (this.field.StringValue != null && this.field.StringValue != '') ? this.field.StringValue : '';
        break;
    }
  }

  initializeList() {
    if (!this.field.list) {
      throw new Error('RicercaFieldRadioComponent: list non definito');
    }
    this.list = this.mapList(this.field.list);
  }

  setBooleanFields() {
    this.list = [
      {
        ID: 'true',
        Description: 'Sì'
      },
      {
        ID: 'false',
        Description: 'No'
      }
    ];
  }

  /**
   * si mappano i risultati in modo che siano di tipo SimpleModel
   * @param l lista da convertire in SimpleList
   */
  mapList(l: any[]): SimpleModel[] {
    return l.map(el => {
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
    });
  }

  /**
   * valore dell'input valore in number
   */
  protected _fieldRadioValue: string | number;

  get fieldRadioValue(): string | number {
    return this._fieldRadioValue;
  }

  set fieldRadioValue(val: string | number) {
    this._fieldRadioValue = val;
    this.fieldStringValue = this.fieldRadioValue != null ? this.fieldRadioValue.toString() : '';
  }

  //si sovrascrive in quanto in questo caso non deve fare niente
  setValueInputFocus() { }

}
