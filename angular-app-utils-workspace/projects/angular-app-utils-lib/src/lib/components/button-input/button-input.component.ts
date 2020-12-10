import { Component, Input, ViewChild, ElementRef, forwardRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


export interface AppButtonInputChange {

  source: ElementRef;
  value: any;

}

@Component({
  selector: 'aaul-button-input',
  templateUrl: './button-input.component.html',
  styleUrls: ['./button-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonInputComponent),
      multi: true
    }
  ]
})
export class ButtonInputComponent implements ControlValueAccessor {

  //TODO aggiungere placeholder e tooltip

  //icona da usare quando item è abilitato
  @Input() icon: string = 'add_circle_outline';
  //icona da usare quando item è disabilitato
  //@Input() iconDisabled: string = 'add_circle';

  //il valore per name e id del tag input
  @Input() set fieldName(val: string) {
    this._fieldName = val;
    if (this.label == null) {
      this.label = val;
    }
  }
  //la label da mostrare sull'input
  @Input() label: string = this.fieldName;//se non specificato, si imposta label uguale a fieldName
  @Input() action: (arg?: any) => void;//azione da eseguire al click dell'icona accanto all'input
  @Input() descriptionExtractor: (el: any) => string = (el: any) => el?.Descrizione;//metodo per ricavare la descrizione da dover mostrare nell'input
  @Input() idExtractor: (el: any) => any = (el: any) => el?.ID;//metodo per ricavare l'ID dell'oggetto dell'input
  @Input() inputStyle: string = '';

  @Input() set preselectedValue(val: any) {
    const id = this.idExtractor(val);
    if (id != null) {
      this.value = id;
      this.element = val;
    }
  }

  @ViewChild('inputRef', { static: true }) inputRef: ElementRef;//element Ref dell'input html

  @Output() onChangeValue = new EventEmitter<AppButtonInputChange>();

  private element: any;
  private _fieldName: string = 'name';
  get fieldName(): string {
    return this._fieldName;
  }

  disableState: boolean = false;//false se è disabilitato il componente

  private _value: any;
  onChange = (_: any) => { };
  onTouched = (_: any) => { };

  get value() {
    return this._value;
  }
  set value(val) {
    /*if (val == null){
      this._value = {};
    }else{
      this._value = val;
    }*/
    this._value = val;
    this.emitChanges();
  }

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.inputRef.nativeElement.disabled = isDisabled;
    this.disableState = isDisabled;
  }

  //notifica cambiamenti del value
  emitChanges() {
    this.onChange(this.value);
    this.onChangeValue.emit({ source: this.inputRef, value: this.value });
  }

  //descrizione da mettere nell'input da mostrare all'utente
  get descrizione(): string {
    return this.descriptionExtractor(this.element);
  }

  //chiamato al click dell'icona del componente
  onClickIconBtn() {
    if (!this.disableState) {
      const idValue = this.value;//this.idExtractor(this.value);
      this.action(idValue);
    }
  }

}
