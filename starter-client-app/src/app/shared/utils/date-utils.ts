import { DatePipe } from '@angular/common';

export function parseDate(date: Date, format: string = 'dd/MM/yyyy', locale: string = 'it-IT'){
    return new DatePipe(locale).transform(date, format);
}