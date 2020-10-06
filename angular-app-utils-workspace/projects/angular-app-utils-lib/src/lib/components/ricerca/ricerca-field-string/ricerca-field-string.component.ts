import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { RicercaFieldAbstractComponent } from '../ricerca-field-abstract.component';


@Component({
  selector: 'aaul-ricerca-field-string',
  templateUrl: './ricerca-field-string.component.html',
  styleUrls: ['./ricerca-field-string.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RicercaFieldStringComponent),
      multi: true
    }
  ]
})
export class RicercaFieldStringComponent extends RicercaFieldAbstractComponent {

  operatori = [
    {
      Label: 'uguale',
      Value: 'equal'
    },
    {
      Label: 'diverso',
      Value: 'notequal'
    },
    {
      Label: 'contiene',
      Value: 'like'
    },
    {
      Label: 'non contiene',
      Value: 'notlike'
    },
    {
      Label: 'inizia per',
      Value: 'likestart'
    },
    {
      Label: 'finisce per',
      Value: 'likeend'
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
    this.fieldStringValue = this.field.StringValue != null ? this.field.StringValue : '';
    this.selectedOperatore = 'equal';
  }

}
