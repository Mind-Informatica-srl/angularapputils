import {Injectable} from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class ItalianMatPaginatorIntl extends MatPaginatorIntl {
  
  constructor() {
    super();  
    this.getAndInitTranslations();
  }

  getAndInitTranslations() {

      this.itemsPerPageLabel = "Risultati per pagina";
      this.nextPageLabel = "Avanti";
      this.previousPageLabel = "Indietro";
      this.firstPageLabel = "Inizio";
      this.lastPageLabel = "Fine";
      this.changes.next();

  }

  //di default altrimenti ci viene resa una stringa del tipo: "1 - 10 of 25". Sostituiamo "of" con "/"
  getRangeLabel = (page: number, pageSize: number, length: number) =>  {
    if (length === 0 || pageSize === 0) {
      return `0 / ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} / ${length}`;
  }

}