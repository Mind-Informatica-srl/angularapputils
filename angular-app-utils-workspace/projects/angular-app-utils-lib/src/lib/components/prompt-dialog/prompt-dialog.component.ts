import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PromptDialogData {
  title: string;
  message: string;
  inputLabel: string;
  showNegativeButton: boolean;
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
  inputRequired: boolean = false;
  
  constructor(public dialogRef: MatDialogRef<PromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromptDialogData) { 
      this.title = data.title;
      this.message = data.message;
      this.inputLabel = data.inputLabel;
      this.showNegativeButton = data.showNegativeButton;
  }

}
