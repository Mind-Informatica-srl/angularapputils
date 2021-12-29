import {
  Component,
  Inject,
  HostListener,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface PromptDialogData {
  /**
   * html del titolo mostrato nell'header del dialog
   *
   * opzionale
   */
  title?: string; //titolo dialog
  /**
   * html del testo da mostrare sotto il titolo
   *
   * opzionale
   */
  message?: string;
  /**
   * la label sopra l'input
   */
  inputLabel: string;
  /**
   * se false non mostra il pulsante annulla
   */
  showNegativeButton?: boolean;
  /**
   * se true l'input è required
   */
  inputRequired: boolean;
  /**
   * eventuale valore di default da mettere nell'input
   */
  defaultValue?: string;
  /**
   * se true mette textArea invece che un input
   *
   * @deprecated Non usare questa proprietà. Usare invece type='textArea'
   */
  textArea?: boolean;
  /**
   * label per pulsante di conferma
   *
   * Di default è 'Ok'
   */
  okLabel?: string;
  /**
   * label per pulsante di annulla
   *
   * Di default è 'Annulla'
   */
  annullaLabel?: string;
  /**
   * type per il tag <input />.
   *
   * Esempio: 'text', 'number', 'date'
   *
   * di default è 'text
   */
  type?: string;
  /**
   * stile css da dare al content
   */
  fontLarger?: boolean;
  /**
   * closure per validare
   */
  customValidator?: (any) => boolean;
  /**
   * tipo del form field da mostrare
   * Può essere 'input', 'textarea' o 'select'.
   *
   * Per la select vanno passate anche le optionsList
   * ed eventualmente il descriptionExtractor
   */
  fieldType: "input" | "textarea" | "select";
  /**
   * di default:
   *
   * (el: any) => el?.Titolo ?? ' - ';
   */
  descriptionExtractor?: (el: any) => string;
  /**
   * lista delle opzioni della select
   */
  optionsList?: any[];
}

@Component({
  selector: "app-prompt-dialog",
  templateUrl: "./prompt-dialog.component.html",
  styleUrls: [
    "../detail/detail.component.scss",
    "./prompt-dialog.component.scss",
  ],
})
export class PromptDialogComponent {
  value: any;

  @ViewChild("dialogInput") dialogInput: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<PromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromptDialogData
  ) {
    this.value = data.defaultValue;
    if (!data.fieldType) {
      if (data.textArea) {
        data.fieldType = "textarea";
      }
      data.fieldType = "input";
    }
    if (data.fieldType == "select" && !data.descriptionExtractor) {
      data.descriptionExtractor = (el: any) => el?.Titolo ?? " - ";
    }
    if (!data.okLabel) {
      data.okLabel = "Ok";
    }
    if (!data.annullaLabel) {
      data.annullaLabel = "Annulla";
    }
    if (data.inputRequired) {
      this.dialogRef.disableClose = true;
    }
    if (data.fieldType == "input" && !data.type) {
      data.type = "text";
    }
    if (!data.customValidator) {
      data.customValidator = () => true;
    }
  }

  get validate(): boolean {
    console.log(
      "***************** value è " +
        this.value +
        " required è " +
        this.data.inputRequired +
        " valid è " +
        this.data.customValidator(this.value)
    );
    console.log(
      "validate è " + this.value != null ||
        (!this.data.inputRequired && this.data.customValidator(this.value))
    );
    return (
      (this.value != null || !this.data.inputRequired) &&
      this.data.customValidator(this.value)
    );
  }

  @HostListener("document:keydown.enter", ["$event"]) onKeydownHandler(
    event: KeyboardEvent
  ) {
    event.preventDefault();
    if (this.validate) {
      this.dialogRef.close(this.value);
    }
  }

  getOptionDisplayValue(option: any): string {
    return option ? `${option.CodCer} - ${option.Descrizione}` : "";
  }
}
