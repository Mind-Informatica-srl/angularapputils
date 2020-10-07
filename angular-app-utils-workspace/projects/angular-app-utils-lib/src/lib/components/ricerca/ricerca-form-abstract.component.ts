import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { ApiDatasource } from '../../api-datasource/api-datasource';
import { UserMessageService } from '../../services/user-message.service';
import { PromptDialogComponent, PromptDialogData } from '../prompt-dialog/prompt-dialog.component';
import { RicercaFieldChange } from './ricerca.model';


/**
 * Component astratto per la ricerca avanzata
 */

export abstract class RicercaFormAbstractComponent<T, S> implements OnInit, OnDestroy {

    /**
     * campi disponibili per la ricerca
     */
    @Input() fields: T[] = [];

    /**
     * campi selezionati per la ricerca
     */
    @Input() selectedFilters: T[] = [];

    @Output() onFilterChanged = new EventEmitter<string>();

    @ViewChild('menuTrigger') public menuTrigger: MatMenuTrigger;

    @Input() canSaveSearch: boolean = false;

    protected filtroDatasource: ApiDatasource<S>;

    protected sub: Subscription = new Subscription();
    private _searchApiUrl: string = null;
    /**
     * stringa per interrogare il server per i criteri di ricerca salvati
     * se non è definito, non si instanzia filtroDatasource
     */
    @Input() set searchApiUrl(val: string) {
        if (val && val != this.searchApiUrl) {
            this._searchApiUrl = val;
            this.initializeDatasource();
        }
    }

    get searchApiUrl(): string {
        return this._searchApiUrl;
    }

    initializeDatasource() {
        this.filtroDatasource = new ApiDatasource(this.httpClient, this.searchApiUrl, this.userMessageService);
        this.loadSavedFilters();
    }

    /**
     * ricerche ottenute dal server. Definite se searchApiUrl è non null
     */
    savedFilters: S[] = [];

    constructor(protected httpClient: HttpClient,
        protected userMessageService: UserMessageService,
        public dialog: MatDialog) { }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    /**
     * aggiunge alla form un nuovo campo di ricerca tra quelli presenti in fields
     * @param item campo di ricerca
     */
    public addFilterField(item: T) {
        try {
            this.menuTrigger.closeMenu();
        } catch (ex) {
            console.log(ex);
        }
        let field = {
            ...item,
            UniqueId: new Date().getTime().toString()
        } as T;
        this.selectedFilters.push(field);
    }

    /**
     * Svuota il filtro
     */
    clean() {
        this.selectedFilters = [];
    }

    /**
     * Avvia ricerca con i campi selezionati
     */
    search() {
        //console.log('search', this.selectedFilters);
        //const param = this.prepareQueryParams();
        //console.log('search param', param);
        this.onFilterChanged.emit('');
    }

    /**
     * Prepara la query per il filtro
     */
    abstract prepareQueryParams(): string;

    onChangeValue(event: RicercaFieldChange) {
        //console.log(event);
    }

    /**
     * rimuove un singolo item di ricerca dalla form
     * @param uniqueId 
     */
    abstract removeField(uniqueId: string): void;

    loadSavedFilterParams(): HttpParams {
        return new HttpParams();
    }

    loadSavedFilters() {
        const params = this.loadSavedFilterParams();
        this.sub.add(this.filtroDatasource.getFilteredElements(params).subscribe((res: S[]) => {
            if (res) {
                this.savedFilters = res;
            } else {
                this.savedFilters = [];
            }
        }));
    }

    onSalvaRicercaClicked(campiRicerca: T[]) {
        this.salvaRicerca(campiRicerca);
    }

    /**
     * salva una ricerca su db
     * 
     * mostra una modal che chiede un nome per salvare il criterio di ricerca
     * invia la richiesta di insert al server
     * 
     * @param campiRicerca elenco dei campi da salvare
     * @param modalTitle titolo della modal
     * @param modalMessage messaggio della modal
     * @param modalInputName label dell'input della modal
     */
    salvaRicerca(campiRicerca: T[], modalTitle: string = 'Salva ricerca', modalMessage: string = 'Inserisci un nome per la ricerca', modalInputName: string = 'Nome') {
        console.log(campiRicerca);
        const promptData: PromptDialogData = {
            title: modalTitle,
            message: modalMessage,
            inputLabel: modalInputName,
            showNegativeButton: true,
            inputRequired: true
        }
        let dialogRef = this.dialog.open(PromptDialogComponent, { data: promptData });
        this.sub.add(dialogRef.afterClosed().subscribe((nomeRicerca: string) => {
            if (nomeRicerca) {
                const ricerca = this.prepareSearchToBeSaved(nomeRicerca, campiRicerca);
                this.filtroDatasource.insert(ricerca).subscribe(res => {
                    this.onSavedSearchInserted(res);
                });
            }
        }));
    }

    abstract prepareSearchToBeSaved(nomeRicerca: string, campiRicerca: T[]): any;

    abstract onSavedSearchInserted(res: any): void;

    /**
     * metodo chiamato alla selezione di un filtro salvato.
     * recupera i singoli filtri cercando il filterFields e associa i valori di default
     * riempie la form di ricerca con quanto ottenuto
     * 
     * @param filtro filtro selezionato
     */
    abstract onSavedSearchClicked(filtro: S): void;

    abstract onDeleteSearchClicked(filtro: S): void;

    abstract onSavedSearchDeleted(res: any, idItem: any): void;

}
