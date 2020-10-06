import { MatSelect, MatSelectChange } from '@angular/material/select';
import { OnInit, Input, Output, ViewChild, EventEmitter, AfterViewInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FieldSelectOption, FilterField, RicercaFieldChange } from './ricerca.model';
import { MatInput } from '@angular/material/input';

/**
 * classe astratta per i campi di ricerca
 * 
 * è costituito oltre che da una label indicante il nome dell'attributo anche da un campo "operatore" e da un campo "valore"
 * 
 * Nome attributo = this.field.Name
 * 
 * selectedOperatore = opzione selezionata dalla select degli operatori (es: "uguale", "maggiore", "isnull", etc...)
 * 
 * fieldStringValue = è il valore in stringa dell'input "valore". Per esempio nel caso del component di ricerca di tipo date, è la data convertita in ISOString
 * 
 * refreshValue() è il metodo che si occupa di settare "value" ovvero il valore completo del component da rendere disponibile nel ngModel
 * 
 * inputName è un nome univoco per il component
 * 
 */
export abstract class RicercaFieldAbstractComponent implements ControlValueAccessor, OnInit, AfterViewInit {

    /**
     * lista degli operatori (la select che permette di stabilire il criterio di confronto con il valore)
     */
    abstract operatori: FieldSelectOption[];

    /**
     * valore dell'input valore in string
     */
    protected _fieldStringValue: string;
    /**
     * valore dell'opzione selezionata
     */
    protected _selectedOperatore: string;

    get fieldStringValue(): string {
        return this._fieldStringValue;
    }

    set fieldStringValue(val: string) {
        this._fieldStringValue = val;
        this.refreshValue();
    }

    get selectedOperatore(): string {
        return this._selectedOperatore;
    }

    set selectedOperatore(val: string) {
        this._selectedOperatore = val;
        this.refreshValue();
    }

    @Input() field: FilterField;

    /**
     * eventEmitter per notificare il cambiamento del valore del component
     */
    @Output() onChangeValue = new EventEmitter<RicercaFieldChange>();

    /**
     * ElementRef dell'input contenente il valore
     */
    @ViewChild('inputRef') inputRef: MatInput | MatSelect;

    /**
     * name univoco
     */
    inputName: string;

    ngOnInit() {
        //si definisce inputName da usare come name univoco nel template HTML
        this.inputName = this.field.UniqueId;
    }

    ngAfterViewInit() {
        this.setValueInputFocus();
    }

    setValueInputFocus() {
        setTimeout(() => {
            try {
                this.inputRef.focus();
            } catch (error) {
                console.log(error);
            }
        }, 300);
    }

    /**
     * è il valore che viene reso disponibile in ngModel quando si usa il componente
     * viene settato in refreshValue con la combinazione del nome dell'attributo, dell'operatore e del valore (il valore è in forma di stringa: fieldStringValue)
     */
    protected _value: string;

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        this.emitChanges();
    }

    /**
     * imposta value qualora selectedOperatore e fieldStringValue non siano undefined
     */
    refreshValue() {
        if (this.selectedOperatore != null && this.fieldStringValue != null) {
            if (this.field.actualFilterMap) {
                this.value = this.field.actualFilterMap(this.field.Name, this.selectedOperatore, this.fieldStringValue);
            } else {
                const name = this.field.parentReference != null ? (this.field.parentReference + '.' + this.field.Name) : this.field.Name;
                this.value = name + '.' + this.selectedOperatore + '=' + this.fieldStringValue;
            }
        }
    }

    onChange = (_: any) => { };

    onTouched = (_: any) => { };

    writeValue(obj: any): void {
        if (obj != null) {
            this.refreshValue();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.inputRef.disabled = isDisabled;
    }

    /**
     * notifica il cambiamento di value
     */
    emitChanges() {
        this.onChange(this.value);
        this.onChangeValue.emit({ name: this.inputName, source: this.inputRef, value: this.value });
    }

    /**
     * se true, nasconde il campo "valore" ( da usare quando selectedOperatore è isnull o isnotnull)
     * viene impostato in onOperatoreChange
     */
    hideValueInput: boolean = false;

    /**
     * chiamato quando si cambia la scelta nella select dell'operatore
     * 
     * si occupa di nascondere il campo del "valore" quando l'operatore selezionato è isnull o isnotnull
     * 
     * altrimenti imposta il focus sul campo "valore"
     * 
     * @param event MatSelectChange
     */
    onOperatoreChange(event: MatSelectChange) {
        if (event.value == 'isnull' || event.value == 'isnotnull') {
            this.hideValueInput = true;
            this.fieldStringValue = '';
        } else {
            this.hideValueInput = false;
            this.setValueInputFocus();
        }
    }

}