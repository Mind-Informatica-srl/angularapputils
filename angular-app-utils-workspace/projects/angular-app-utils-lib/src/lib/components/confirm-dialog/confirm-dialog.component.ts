import { Component, Inject, HostListener } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MessageType } from "../../services/user-message.service";

/**
 * title: string;
 * titolo della modale
 *
 * message: string;
 * eventuale messaggio in formato html
 *
 * action: MessageType;
 * non in uso
 *
 * showNegativeButton: boolean;
 * * se true, mostra anche pulsante negativo
 * * se false, ConfirmDialogComponent ha la funzione di alert
 *
 * positiveButtonText?: string;
 * testo pulsante positivo. se non specificato è "OK"
 *
 * negativeButtonText?: string;
 * testo pulsante negativo. se non specificato è "Annulla"
 *
 * style2?: boolean;
 * se true, modifica lo stile del pulsante negativo
 */
export interface ConfirmDialogData {
  title: string;
  message: string;
  action: MessageType;
  showNegativeButton: boolean;
  positiveButtonText?: string;
  negativeButtonText?: string;
  // se true, modifica lo stile del pulsante negativo
  style2?: boolean;
}

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  //se c'è solo il pulsante ok, all'invio si chiude il dialog
  @HostListener("document:keydown.enter", ["$event"]) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (!this.data.showNegativeButton) {
      event.preventDefault();
      this.dialogRef.close();
    }
  }

  get positiveText(): string {
    return this.data.positiveButtonText ? this.data.positiveButtonText : "OK";
  }

  get negativeText(): string {
    return this.data.negativeButtonText
      ? this.data.negativeButtonText
      : "Annulla";
  }
}
