import { MatSelect } from '@angular/material/select';
import { ElementRef } from '@angular/core';
import { MatInput } from '@angular/material/input';

/**
 * tipi possibili per Type in FilterField
 */
export enum FilterFieldType {
    String,
    Date,
    Number,
    StaticSelect,
    DynamicSelect,
    StaticSelectNumber,
    DynamicSelectNumber,
    RadioString,
    RadioNumber,
    RadioBoolean
}

/**
 * interfaccia per gli item del menu del filtro di ricerca
 * 
 * 
 */
export interface FilterField {

    /**
     * campo da usare per la ricerca su server
     */
    Name: string;
    /**
     * campo da mostrare lato utente
     */
    Label: string;
    /**
     * Tipo del filtro di ricerca: FilterFieldType
     */
    Type: FilterFieldType;
    /**
     * valore iniziale facoltativo sotto forma di stringa (le date vanno passate come ISOSrting)
     */
    StringValue?: string;
    /**
     * valore che usa il salvataggio delle ricerche
     */
    ActualValueString?: string;
    /**
     * valore in string adell'operatore di default selezionato
     */
    ActualOperator?: string;
    /**
     * campo settato automaticamente al fine di avere tag html con name univoco
     */
    UniqueId?: string;
    /**
     * url da aggiungere obbligatoriamente se l'item è di tipo DynamicSelect o DynamicSelectNumber 
     * per prendere i dati dal server
     */
    ApiUrl?: string;
    /**
     * per campi di tipo select e radio
     * Specificare tale attributo per indicare la chiave primaria per le option delle select
     * Di default è ID ed in tal caso si può non specificare
     */
    IDField?: string;
    /**
    * per campi di tipo select e radio
    * Specificare tale attributo per indicare la descrizione da mostrare all'utente per le option delle select
    * Di default è Description ed in tal caso si può non specificare
    */
    DescriptionField?: string;
    /**
     * per i campi di tipo select e radio
     * lista delle option statica
     */
    list?: any[];
    /**
     * converte il valore restituito da un item sovrascrivendo il comportamento normale
     * prende in input fieldName: string, operator: string, value: any
     * restituisce una stringa (da passare al server)
     */
    actualFilterMap?: (fieldName: string, operator: string, value: any) => string;
    /**
     * nome dell'icona di tipo mat-icon
     */
    iconName?: string;
    /**
     * figli per un nested-menu
     */
    children?: FilterField[];
    /**
     * attributo di un nodo padre con figli
     * specificare il riferimento che dovranno avere i figli
     * Es: ClienteID|clienti|ID
     */
    childrenReference?: string;
    /**
     * impostato programmaticamente, serve per i campi figli per associare la dipendenza con i padri
     */
    parentReference?: string;

}

/**
 * interfaccia per gli eventEmitter chiamati al click su un item del menu
 */
export interface RicercaFieldChange {

    name: string;
    source: ElementRef | MatInput | MatSelect;
    value: any;

}

/**
 * interfaccia per le option degli operatori
 */
export interface FieldSelectOption {

    Label: string;
    Value: string;

}

/**
 * interfaccia per le option di select e radio
 */
export interface SimpleModel {

    ID: number | string;
    Description: string;

}

/**
 * si mappa un array i risultati in modo che siano di tipo SimpleModel
 * 
 * @param l lista da convertire in SimpleList
 */
export function mapSimpleModelList(l: any[], idField: string = 'ID', descriptionField: string = 'Description'): SimpleModel[] {
    if (l) {
        return l.map(el => mapSimpleModelListElement(el, idField, descriptionField));
    }
    return [];
}

/**
 * si mappano i risultati in modo che siano di tipo SimpleModel
 * 
 * @param l lista da convertire in SimpleList
 */
export function mapSimpleModelListElement(el: any, idField: string = 'ID', descriptionField: string = 'Description'): SimpleModel {
    let valueId: string;
    if (idField.includes('#')) {
        const ids = idField.split('#');
        for (let i = 0; i < ids.length; i++) {
            const idVal = ids[i];
            if (valueId) {
                valueId += "#";
            } else {
                valueId = "";
            }
            valueId += el[idVal];
        }
    } else {
        valueId = el[idField];
    }
    return {
        ID: valueId,
        Description: el[descriptionField]
    } as SimpleModel
}

// export interface NavItem {
//     displayName: string;
//     iconName?: string;
//     children?: NavItem[];

//     onClick?(): void;
// }


/**
 * interfaccia utile per salvare su db
 */
export interface Filtro {

    ID?: number;
    Nome: string;
    Sezione: string;
    UtenteID: number;
    CreatedAt?: Date;
    UpdatedAt?: Date;
    FiltroCampi?: FiltroCampo[];

}

export interface FiltroCampo {

    ID?: number;
    FiltroID?: number;
    Name: string;
    Label: string;
    StringValue?: string;
    DefaultOperator?: string;
    ChildrenReference?: string;
    CreatedAt?: Date;
    UpdatedAt?: Date;

}
