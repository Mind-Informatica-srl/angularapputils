import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PromptDialogData {
  title: string;//titolo dialog
  message: string;//sotto titolo
  inputLabel: string;//la label sopra l'input
  showNegativeButton?: boolean;//se false non mostra il pulsante annulla
  inputRequired: boolean;//se tru è required
  defaultValue?: string;//eventuale valore di default da mettere nell'input
  textArea?: boolean;//se true mette textArea invece che un input
  okLabel?: string;//label per pulsante di conferma
  annullaLabel?: string;//label per pulsante di annulla
}

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: [
    '../detail/detail.component.scss',
    './prompt-dialog.component.scss'
  ]
})
export class PromptDialogComponent {

  showNegativeButton: boolean;
  title: string = null;
  message: string;
  inputLabel: string;
  inputRequired: boolean;
  value: string;
  textArea: boolean;
  okLabel: string = 'Ok';
  annullaLabel: string = 'Annulla';
  
  constructor(public dialogRef: MatDialogRef<PromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromptDialogData) { 
      this.title = data.title;
      this.message = data.message;
      this.inputLabel = data.inputLabel;
      this.showNegativeButton = data.showNegativeButton;
      this.inputRequired = data.inputRequired;
      this.value = data.defaultValue;
      this.textArea = data.textArea;
      if(data.okLabel){
        this.okLabel = data.okLabel
      }
      if(data.annullaLabel){
        this.annullaLabel = data.annullaLabel;
      }
      if(this.inputRequired){
        this.dialogRef.disableClose = true;
      }
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    event.preventDefault();
    this.dialogRef.close(this.value);      
  }

}
