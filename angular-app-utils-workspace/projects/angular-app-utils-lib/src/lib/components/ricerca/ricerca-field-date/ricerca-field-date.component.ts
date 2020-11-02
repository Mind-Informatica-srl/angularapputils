import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { RicercaFieldAbstractComponent } from '../ricerca-field-abstract.component';


@Component({
  selector: 'aaul-ricerca-field-date',
  templateUrl: './ricerca-field-date.component.html',
  styleUrls: ['./ricerca-field-date.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RicercaFieldDateComponent),
      multi: true
    }
  ]
})
export class RicercaFieldDateComponent extends RicercaFieldAbstractComponent {

  operatori = [
    {
      Label: 'uguale',
      Value: 'equaldate'
    },
    {
      Label: 'diverso',
      Value: 'notequaldate'
    },
    {
      Label: 'maggiore',
      Value: 'gtdate'
    },
    {
      Label: 'minore',
      Value: 'ltdate'
    },
    {
      Label: 'maggiore o uguale',
      Value: 'gtedate'
    },
    {
      Label: 'minore o uguale',
      Value: 'ltedate'
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

  onFieldSetted() {
    super.onFieldSetted();
    this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator : 'equaldate';
    if (this.selectedOperatore == 'isnull' || this.selectedOperatore == 'isnotnull') {
      this.hideValueInput = true;
    }
    try {
      this.fieldDateValue = (this.field.StringValue != null && this.field.StringValue != '') ? new Date(Date.parse(this.field.StringValue)) : new Date();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * valore dell'input valore in number
   */
  protected _fieldDateValue: Date;

  get fieldDateValue(): Date {
    return this._fieldDateValue;
  }

  set fieldDateValue(val: Date) {
    if (val) {
      //val.setHours(0, 0, 0, 0);
      let userTimezoneOffset = val.getTimezoneOffset() * 60000;
      this._fieldDateValue = new Date(val.getTime() - userTimezoneOffset);//si rimuove il timezone
      this.fieldStringValue = this.fieldDateValue != null ? this.fieldDateValue.toISOString() : '';//si converte la data in stringa: 2020-10-01T22:00:00.000Z
    }
  }

}