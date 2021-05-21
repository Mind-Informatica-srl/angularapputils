import { Component, Inject, HostListener } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MessageType } from "../../services/user-message.service";

export interface ConfirmDialogData {
  title: string;
  message: string;
  action: MessageType;
  showNegativeButton: boolean;
  confirmButtonText?: string;
  negativeButtonText?: string;
}

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"],
})
export class ConfirmDialogComponent {
  showNegativeButton: boolean;
  confirmButtonText: string = "OK";
  negativeButtonText: string = "Annulla";

  title: string = null;
  message: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    this.title = data.title;
    this.message = data.message;
    this.showNegativeButton = data.showNegativeButton;
    if (data.confirmButtonText && data.confirmButtonText != "") {
      this.confirmButtonText = data.confirmButtonText;
    }
    if (data.negativeButtonText && data.negativeButtonText != "") {
      this.negativeButtonText = data.negativeButtonText;
    }
  }

  //se c'è solo il pulsante ok, all'invio si chiude il dialog
  @HostListener("document:keydown.enter", ["$event"]) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (!this.showNegativeButton) {
      event.preventDefault();
      this.dialogRef.close();
    }
  }
}
