import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageType } from '../../services/user-message.service';

export interface ConfirmDialogData {
  title: string;
  message: string;
  action: MessageType;
  showNegativeButton: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  showNegativeButton: boolean;
  title: string = null;
  message: string;
  
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { 
      this.title = data.title;
      this.message = data.message;
      this.showNegativeButton = data.showNegativeButton;
  }

  //se c'è solo il pulsante ok, all'invio si chiude il dialog
  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if(!this.showNegativeButton){
      event.preventDefault();
      this.dialogRef.close();
    }
  }

}
