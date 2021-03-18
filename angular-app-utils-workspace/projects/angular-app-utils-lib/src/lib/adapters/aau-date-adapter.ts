import { NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

@Injectable()
export class AauDateAdapter extends NativeDateAdapter {

    getFirstDayOfWeek(): number {
      return 1;
    }
   
    parse(value: any): Date | null {
      if (!value) { return null; }
      return this.toDate(value);
    }

    private toDate(dateStr) {
      const [day, month, year] = dateStr.split(/[-\/.]/);
      return new Date(year, month - 1, day);
    }
    
  }