import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Input, OnInit, OnDestroy, EventEmitter, Output, Directive } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ApiDatasource } from '../../api-datasource/api-datasource';
import { UserMessageService } from '../../services/user-message.service';
import { PromptDialogData, PromptDialogComponent } from '../prompt-dialog/prompt-dialog.component';
import { CampoStampaInterface, StampaFormConfig, StampaModalResponse } from './stampa.model';



@Directive()
export abstract class StampaFormAbstractComponent<S> implements OnInit, OnDestroy {

    /**
     * permette di configurare il component dalla modal passando un unico oggetto di tipo StampaFormConfig
     */
    @Input() set config(conf: StampaFormConfig) {
        if (conf) {
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

    /**
     * layout di stampa ottenute dal server. Definite se layoutApiUrl è non null
     */
    savedLayout: S[] = [];

    /**
     * lista completa delle colonne disponibili
     */
    private _columns: CampoStampaInterface[] = [];

    /**
     * setter per le colonne selezionate
     * se selectedColumns è definito, imposta notSelectedColumns con gli elementi di columns non in selectColumnNames
     */
    @Input() set columns(values: CampoStampaInterface[]) {
        if (this._columns != values) {
            this._columns = values;
            if (this.selectedColumns) {
                this.setNotSelectedColumns();
            } else {
                this.notSelectedColumns = values;
            }
        }
    }

    get columns(): CampoStampaInterface[] {
        return this._columns;
    }

    /**
     * colonne non selezionate
     */
    notSelectedColumns: CampoStampaInterface[] = [];

    /**
     * colonne selezionate
     */
    private _selectedColumnNames: CampoStampaInterface[] = [];

    /**
     * setter per le colonne selezionate
     * se columns è definito, imposta notSelectedColumns con gli elementi di columns non in selectColumnNames
     */
    @Input() set selectedColumns(values: CampoStampaInterface[]) {
        this._selectedColumnNames = values;
        if (values && this.columns) {
            this.setNotSelectedColumns();
        }
    }

    get selectedColumns(): CampoStampaInterface[] {
        return this._selectedColumnNames;
    }

    /**
     * possibili formati di stampa
     */
    @Input() formats: string[] = ['pdf', 'csv'];

    @Input() selectedFormat: string = 'csv';
    /**
     * eventEmitter chiamato per stampare
     * passa l'elenco delle colonne da stampare
     */
    @Output() onPrint = new EventEmitter<StampaModalResponse>();

    protected sub: Subscription = new Subscription();
    private _layoutApiUrl: string = null;
    /**
     * datasource per interrogare il server per salvare, cancellare e ottenere i criteri di ricerca da db
     */
    protected layoutDatasource: ApiDatasource<S>;
    /**
    * stringa per interrogare il server per i criteri di ricerca salvati
    * se non è definito, non si instanzia filtroDatasource
    */
    @Input() set layoutApiUrl(val: string) {
        if (val && val != this.layoutApiUrl) {
            this._layoutApiUrl = val;
            this.initializeDatasource();
        }
    }

    get layoutApiUrl(): string {
        return this._layoutApiUrl;
    }

    constructor(protected httpClient: HttpClient,
        protected userMessageService: UserMessageService,
        public dialog: MatDialog) { }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    initializeDatasource() {
        this.layoutDatasource = new ApiDatasource(this.httpClient, this.layoutApiUrl, this.userMessageService);
        this.loadSavedLayout();
    }

    loadSavedLayout() {
        const params = this.loadSavedLayoutParams();
        this.sub.add(this.layoutDatasource.getFilteredElements(params).subscribe((res: S[]) => {
            if (res) {
                this.savedLayout = res;
            } else {
                this.savedLayout = [];
            }
        }));
    }

    loadSavedLayoutParams(): HttpParams {
        return new HttpParams();
    }

    setNotSelectedColumns() {
        const columnValues = this.selectedColumns.map(el => el.Value);
        this.notSelectedColumns = this.columns.filter((el) => {
            return !columnValues.includes(el.Value)
        });
    }

    /**
     * da chiamare per eseguire la richiesta di stampa
     */
    print() {
        if (this.selectedFormat != null) {
            this.onPrint.emit({ Campi: this.selectedColumns.map(el => el.Value), Formato: this.selectedFormat, Headers: this.selectedColumns.map(el => el.Description) } as StampaModalResponse);
        } else {
            console.log("Manca il formato di stampa");
        }
    }

    /**
     * chiamato al click su salva per salvare un layout
     * @param campi elenco dei campi da salvare
     */
    onSalvaLayoutClicked(campi: CampoStampaInterface[]) {
        this.salvaLayout(campi);
    }

    /**
     * salva una ricerca su db
     * 
     * mostra una modal che chiede un nome per salvare il criterio di layout di stampa
     * invia la richiesta di insert al server
     * 
     * @param campi elenco dei campi da salvare
     * @param modalTitle titolo della modal
     * @param modalMessage messaggio della modal
     * @param modalInputName label dell'input della modal
     */
    salvaLayout(campi: CampoStampaInterface[], modalTitle: string = 'Salva layout', modalMessage: string = 'Inserisci un nome per il layout', modalInputName: string = 'Nome') {
        console.log(campi);
        const promptData: PromptDialogData = {
            title: modalTitle,
            message: modalMessage,
            inputLabel: modalInputName,
            showNegativeButton: true,
            inputRequired: true
        }
        let dialogRef = this.dialog.open(PromptDialogComponent, { data: promptData });
        this.sub.add(dialogRef.afterClosed().subscribe((nomeLayout: string) => {
            if (nomeLayout) {
                const l = this.prepareLayoutToBeSaved(nomeLayout, campi);
                this.layoutDatasource.insert(l).subscribe(res => {
                    this.onInsertCompleted(res);
                });
            }
        }));
    }

    abstract prepareLayoutToBeSaved(nomeLayout: string, campi: CampoStampaInterface[]): any;

    abstract onInsertCompleted(res: any): void;

    /**
    * metodo chiamato alla selezione di un layout salvato.
    * recupera i singoli campi
    * riempie la form con quanto ottenuto
    * 
    * @param layout layout selezionato
    */
    abstract onSavedLayoutSelected(layout: S): void;

    /**
     * chiamato al click sul cancella su uno dei layout salvati
     * @param layout layout da cancellare
     */
    abstract onDeleteLayoutClicked(layout: S): void;

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

}