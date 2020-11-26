import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StampaInterface, StampaUtenteFormConfig } from '../stampa.model';


export interface StampaDialogData {

  config: StampaUtenteFormConfig;

}

@Component({
  selector: 'aaul-stampa-modal',
  templateUrl: './stampa-modal.component.html',
  styleUrls: ['./stampa-modal.component.scss']
})
export class StampaModalComponent {

  private config: StampaUtenteFormConfig;

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: StampaDialogData) {
    if (data) {
      this.stampaFormConfig = data.config;
    }
  }

  /**
     * eventEmitter chiamato per stampare
     * passa l'elenco delle colonne da stampare
     */
  onPrintEvent(stampaConf: StampaInterface) {
    this.dialogRef.close(stampaConf);
  }

  get stampaFormConfig(): StampaUtenteFormConfig {
    return this.config;
  }

  set stampaFormConfig(values: StampaUtenteFormConfig) {
    let stampaConf = {} as StampaUtenteFormConfig;
    if (values) {
      if (values.ColumnNames) {
        stampaConf.ColumnNames = values.ColumnNames;
      }
      if (values.SelectedColumnNames) {
        stampaConf.SelectedColumnNames = values.SelectedColumnNames;
      }
      if (values.Formats) {
        stampaConf.Formats = values.Formats;
      }
      if (values.SelectedFormat) {
        stampaConf.SelectedFormat = values.SelectedFormat;
      }
      if (values.LayoutApiUrl) {
        stampaConf.LayoutApiUrl = values.LayoutApiUrl;
      }
      if (values.Sezione) {
        stampaConf.Sezione = values.Sezione;
      }
      if (values.UtenteID) {
        stampaConf.UtenteID = values.UtenteID;
      }
    }
    this.config = stampaConf;
  }

}
