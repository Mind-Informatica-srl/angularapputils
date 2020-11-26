import { Component, Input } from '@angular/core';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { StampaFormAbstractComponent } from '../stampa-form-abstract.component';
import { StampaUtenteFormConfig, StampaUtente, CampoStampaInterface } from '../stampa.model';

@Component({
  selector: 'aaul-stampa-form',
  templateUrl: './stampa-form.component.html',
  styleUrls: ['./stampa-form.component.scss']
})
export class StampaFormComponent extends StampaFormAbstractComponent<StampaUtente> {

  /**
     * permette di configurare il component dalla modal passando un unico oggetto di tipo StampaFormConfig
     */
  @Input() set config(conf: StampaUtenteFormConfig) {
    if (conf) {
      if (conf.Sezione) {
        this.sezione = conf.Sezione;
      }
      if (conf.UtenteID) {
        this.userId = conf.UtenteID;
      }
      if (conf.ColumnNames) {
        this.columns = conf.ColumnNames;
      }
      if (conf.SelectedColumnNames) {
        this.selectedColumns = conf.SelectedColumnNames;
      }
      if (conf.Formats) {
        this.formats = conf.Formats;
      }
      if (conf.SelectedFormat) {
        this.selectedFormat = conf.SelectedFormat;
      }
      if (conf.LayoutApiUrl) {
        this.layoutApiUrl = conf.LayoutApiUrl;
      }
    }
  }

  @Input() isPrinting: boolean = false;
  @Input() sezione: string = '';
  @Input() userId: string | number;

  //da classe astratta
  prepareLayoutToBeSaved(nomeLayout: string, campi: CampoStampaInterface[]) {
    return {
      Nome: nomeLayout,
      Sezione: this.sezione,
      UtenteID: this.userId,
      Formato: this.selectedFormat,
      Campi: campi
    } as StampaUtente;
  }

  //da classe astratta
  onInsertCompleted(res: any): void {
    this.savedLayout.push(res);
  }

  //da classe astratta
  onSavedLayoutSelected(layout: StampaUtente): void {
    if (layout.Campi != null && layout.Campi.length > 0) {
      // si esegue map.value per prendere solamente Value e Description e non eventuali id (provenienti da layout salvati)
      this.selectedColumns = (layout.Campi as CampoStampaInterface[]).map(el => {
        return {
          Value: el.Value,
          Description: el.Description
        } as CampoStampaInterface
      });
    }
    if (layout.Formato != null) {
      this.selectedFormat = layout.Formato;
    }
  }

  //da classe astratta
  onDeleteLayoutClicked(layout: StampaUtente): void {
    this.deleteLayout(layout);
  }

  /**
   * metodo per cancellare una ricerca salvata
   * 
   * apre prima una modal per chiedere conferma della cancellazione
   * 
   * @param filtro filtro da cancellare
   * @param modalTitle titolo della modal
   * @param modalMessage messaggio della modal
   */
  deleteLayout(layout: StampaUtente, modalTitle: string = `Elimina Layout`, modalMessage: string = `<p>Si desidera eliminare il layout ${layout.Nome}?</p>`) {
    let deleteDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: modalTitle,
        message: modalMessage,
        showNegativeButton: true
      }
    });
    this.sub.add(deleteDialog.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.layoutDatasource.delete(layout).subscribe(res => {
          this.onLayoutDeleted(layout.ID);
        });
      }
    }));
  }

  onLayoutDeleted(idItem: any) {
    const i = this.savedLayout.findIndex(el => el.ID == idItem);
    this.savedLayout.splice(i, 1);
  }


  //da classe astratta
  loadSavedLayoutParams() {
    let params = super.loadSavedLayoutParams();
    const utenteId = this.userId;
    return params.set('UtenteID', utenteId.toString()).set('Sezione', this.sezione);
  }
}
