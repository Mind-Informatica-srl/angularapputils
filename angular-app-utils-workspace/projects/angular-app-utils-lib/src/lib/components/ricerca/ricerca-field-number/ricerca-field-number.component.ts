import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { RicercaFieldAbstractComponent } from '../ricerca-field-abstract.component';


@Component({
  selector: 'app-ricerca-field-number',
  templateUrl: './ricerca-field-number.component.html',
  styleUrls: ['./ricerca-field-number.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RicercaFieldNumberComponent),
      multi: true
    }
  ]
})
export class RicercaFieldNumberComponent extends RicercaFieldAbstractComponent {

  operatori = [
    {
      Label: 'uguale',
      Value: 'equalnumber'
    },
    {
      Label: 'diverso',
      Value: 'notequalnumber'
    },
    {
      Label: 'maggiore',
      Value: 'gt'
    },
    {
      Label: 'minore',
      Value: 'lt'
    },
    {
      Label: 'maggiore o uguale',
      Value: 'gte'
    },
    {
      Label: 'minore o uguale',
      Value: 'lte'
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

  ngOnInit() {
    super.ngOnInit();
    this.selectedOperatore = 'equalnumber';
    this.fieldNumberValue = this.field.NumberValue != null ? this.field.NumberValue : 0;
    this.field.NumberValue = this.fieldNumberValue;
  }

  /**
   * valore dell'input valore in number
   */
  protected _fieldNumberValue: number;

  get fieldNumberValue(): number {
    return this._fieldNumberValue;
  }

  set fieldNumberValue(val: number) {
    this._fieldNumberValue = val;
    this.fieldStringValue = this.fieldNumberValue.toString();
  }

}
