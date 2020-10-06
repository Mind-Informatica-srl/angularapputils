import { Component, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';
import { FilterField } from '../ricerca.model';

@Component({
  selector: 'aaul-ricerca-menu',
  templateUrl: './ricerca-menu.component.html',
  styleUrls: ['./ricerca-menu.component.scss']
})
export class RicercaMenuComponent implements OnInit {

  @Input('items')
  public set items(val: FilterField[]) {
    if (val) {
      this._items = val.map(el => {
        return {
          ...el,
          children: this.prepareFieldChildren(el)
        }
      })
    } else {
      this._items = val;
    }
  }

  private _items: FilterField[];

  public get items(): FilterField[] {
    return this._items;
  }

  @ViewChild('childMenu', { static: true }) public childMenu: any;

  @Output() onMenuItemClick = new EventEmitter<FilterField>();

  constructor() { }

  ngOnInit() {
  }

  /**
   * si rendono i children (se presenti) con la correzione 
   * di Label (si aggiunge davanti tra parentesi la label del parent a cui si riferiscono)
   * e di parentReference
   * @param field item padre
   */
  prepareFieldChildren(field: FilterField): FilterField[] {
    if (field.children && field.children.length > 0) {
      return field.children.map(el => {
        return {
          ...el,
          Label: "(" + field.Label + ") " + el.Label,
          parentReference: field.parentReference != null ? (field.parentReference + '.' + field.childrenReference) : field.childrenReference
        }
      });
    }
    return null;
  }

  /**
   * chiamato al click di un item selezionabile (senza figli)
   * @param item FilterField
   */
  onClick(item: FilterField) {
    this.onMenuItemClick.emit(item);
  }

  /**
   * si restituisce la label senza le parentesi contenenti i nomi dei parent collegati (se presenti)
   * @param value label da valutare
   */
  getMenuItemLabel(value: string): string {
    if (value) {
      const i = value.lastIndexOf(')');
      if (i > -1) {
        return value.substring(i + 2);
      }
      return value;
    }
    return '';
  }

}
