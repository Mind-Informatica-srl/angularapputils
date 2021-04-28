import { Component, forwardRef, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { MatDatepicker } from '@angular/material/datepicker';
import { AauDateAdapter } from '../../adapters/aau-date-adapter';
import { MatDatepickerInputEvent } from '@angular/material/datepicker/datepicker-input-base';

/**
 * Component per gestire Data e Ora
 */
@Component({
  selector: 'aaul-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    },
    {
      provide: DateAdapter,
      useClass: AauDateAdapter
    }
  ]
})
export class DateTimePickerComponent implements ControlValueAccessor, AfterViewInit {

  @Input() dateTitle: string = "Data";
  @Input() timeTitle: string = "Ora";

  private _value: Date;
  onChange = (_: any) => { };
  onTouched = (_: any) => { };
  @ViewChild(MatDatepicker, { static: true }) datePicker: MatDatepicker<Date>;
  @ViewChild('dateInput', { static: true }) dateInput: ElementRef;
  @ViewChild('timeInput', { static: true }) timeInput: ElementRef;
  //@ViewChild('colorSpan', { static: true }) colorSpan: ElementRef;

  @Input() color: string = '#15aabf';
  @Input() color2: string = '#8ad5df';

  @Input() required: boolean = false;

  get value() {
    return this._value;
  }
  set value(val) {
    if (val != null) {
      this._value = new Date(val);
    } else {
      this._value = val;
    }
  }

  get date() {
    return this.value;
  }

  set date(val: Date) {
    try {
      if (this._value == null || val == null) {
        this._value = val
      } else {
        this._value.setFullYear(val.getFullYear());
        this._value.setMonth(val.getMonth());
        this._value.setDate(val.getDate());
      }
    } catch (ex) {
      console.log('Errore DateTimePicker', ex);
      this._value = null;
    }
    this.emitChanges();
  }

  get time() {
    return this.value ? (this.parseHour(this.value.getHours()) + ":" + this.parseHour(this.value.getMinutes())) : '';
  }

  set time(val: string) {
    if (val.indexOf(':') > 0) {
      const newVal: string[] = val ? val.split(':') : ['00', '00'];
      this._value.setHours(parseInt(newVal[0]));
      this._value.setMinutes(parseInt(newVal[1]));
      this.emitChanges();
    }
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
  disableState: boolean = false;
  setDisabledState?(isDisabled: boolean): void {
    this.datePicker.disabled = isDisabled;
    this.datePicker.datepickerInput.disabled = isDisabled;
    this.disableState = isDisabled;
  }

  emitChanges() {
    this.onChange(this.value);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      //dentro timeoute per non avere errore angular "changed after checked"      
      this.clockTheme = {
        /*container: {
            bodyBackgroundColor: 'red'/*,
            buttonColor: '#fff'
        },*/
        dial: {
          dialBackgroundColor: this.color,
        },
        clockFace: {
          //clockFaceBackgroundColor: '#555',
          clockHandColor: this.color2,
          //clockFaceTimeInactiveColor: 'red'
        }
      };
    }, 100);

  }

  clockTheme: NgxMaterialTimepickerTheme;

  /**
   * 
   * @param value number da trasformare in stringa (con eventualmente uno zero davanti)
   */
  parseHour(value: number): string {
    if (value == null) {
      return '00';
    }
    return value < 10 ? '0' + value : value.toString();
  }

  addDateEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    console.log(`${type}: ${event.value}`);
    if (event.value == null) {
      if (type == 'date-input' || type == 'date-change') {
        (this.dateInput.nativeElement as HTMLInputElement).value = null;
      }
    }
  }

  //chiamato al blur dell'input time
  onTimeInputBlur(type: string, event) {
    console.log(event);
    if (!this.isCorrectTime(event.target.value)) {
      (this.timeInput.nativeElement as HTMLInputElement).value = '00:00';
    }
    this.time = event.target.value;
  }

  //chiamato quando viene impostato un orario dal time picker
  onTimePickerChanged(newTime: string) {
    if (!this.timeInput.nativeElement.disabled) {
      this.time = newTime;
    }
  }

  //verifica se la stringa passata è effettivamente un orario
  isCorrectTime(value: string): boolean {
    if (value == null) {
      return false;
    }
    return /^([0-1]?[0-9]|2[0-4]):([0-5]?[0-9])(:[0-5][0-9])?$/.test(value);
  }

}
