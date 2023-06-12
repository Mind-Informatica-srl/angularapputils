import {
  FilterFieldType,
  mapSimpleModelList,
  SimpleModel,
} from "./../ricerca.model";
import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { RicercaFieldAbstractComponent } from "../ricerca-field-abstract.component";

@Component({
  selector: "aaul-ricerca-field-radio",
  templateUrl: "./ricerca-field-radio.component.html",
  styleUrls: ["./ricerca-field-radio.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RicercaFieldRadioComponent),
      multi: true,
    },
  ],
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

  get defaultOperatore(): string {
    switch (this.field.Type) {
      case FilterFieldType.RadioNumber:
        return "equalnumber";
      case FilterFieldType.RadioBoolean:
        return "equalboolean";
      case FilterFieldType.RadioString:
        return "equal";
    }
    return "equal";
  }

  onFieldSetted() {
    super.onFieldSetted();
    this.descriptionField = this.field.DescriptionField
      ? this.field.DescriptionField
      : "Description";
    this.idField = this.field.IDField ? this.field.IDField : "ID";
    switch (this.field.Type) {
      case FilterFieldType.RadioNumber:
        this.initializeList();
        this.setValidOperator(this.field.ActualOperator);
        // this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator : this.defaultOperatore;
        if (
          this.selectedOperatore == "isnull" ||
          this.selectedOperatore == "isnotnull"
        ) {
          this.hideValueInput = true;
        }
        this.fieldRadioValue =
          this.field.StringValue != null && this.field.StringValue != ""
            ? parseFloat(this.field.StringValue)
            : 0;
        break;
      case FilterFieldType.RadioBoolean:
        this.setBooleanFields();
        this.setValidOperator(this.field.ActualOperator);
        // this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator : this.defaultOperatore;
        if (
          this.selectedOperatore == "isnull" ||
          this.selectedOperatore == "isnotnull"
        ) {
          this.hideValueInput = true;
        }
        this.fieldRadioValue =
          this.field.StringValue != null && this.field.StringValue != ""
            ? this.field.StringValue
            : "true";
        break;
      default:
        this.initializeList();
        this.setValidOperator(this.field.ActualOperator);
        // this.selectedOperatore = this.field.ActualOperator != null ? this.field.ActualOperator :this.defaultOperatore;
        if (
          this.selectedOperatore == "isnull" ||
          this.selectedOperatore == "isnotnull"
        ) {
          this.hideValueInput = true;
        }
        this.fieldRadioValue =
          this.field.StringValue != null && this.field.StringValue != ""
            ? this.field.StringValue
            : "";
        break;
    }
  }

  initializeList() {
    if (!this.field.list) {
      throw new Error("RicercaFieldRadioComponent: list non definito");
    }
    this.list = mapSimpleModelList(
      this.field.list,
      this.idField,
      this.descriptionField
    );
  }

  setBooleanFields() {
    this.list = [
      {
        ID: "true",
        Description: "Sì",
      },
      {
        ID: "false",
        Description: "No",
      },
    ];
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
    this.fieldStringValue =
      this.fieldRadioValue != null ? this.fieldRadioValue.toString() : "";
  }

  //si sovrascrive in quanto in questo caso non deve fare niente
  setValueInputFocus() {}
}
