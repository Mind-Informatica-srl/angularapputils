import { ListComponent } from '../list/list.component';
import { MatTableDataSource } from '@angular/material/table';
import { ApiActionsType } from '../../api-datasource/api-datasource';
import { Input } from '@angular/core';


export abstract class GridListComponent<T, LoginInfo> extends ListComponent<T, LoginInfo> {

  abstract displayedColumns: string[];

  setDataSourceAttributes() {
    if (this.tableDataSource != null) {
      //this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
    }
  }

  get tableDataSource(): MatTableDataSource<T> {
    return this.dataSource as MatTableDataSource<T>;
  }

  @Input() set list(data: T[]) {
    this.setTableDataSourceFromArray(data);
  }

  protected setTableDataSourceFromArray(data: T[]) {
    if (this.tableDataSource == null) {
      this.dataSource = new MatTableDataSource(data);
      this.setCustomSort();
    } else {
      this.tableDataSource.data = data;
    }
    this.tableDataSource.sort = this.sort;
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.tableDataSource != null) {
      this.tableDataSource.sort = this.sort;
    }
  }

  get dataSourceArray(): T[] {
    return this.tableDataSource.data;
  }

  onListLoaded(data: T[]) {
    this.setTableDataSourceFromArray(data);
  }

  protected setCustomSort(): void {
  }

  applyFilter(event: Event): void {
    //non si chiama il super. Qui dataSource è di tipo MatTableDataSource e possiamo applicare il suo metodo "filter"
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    /*if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }*/
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  deleteItemRow(id: any) {
    super.deleteItemRow(id);
    this.tableDataSource.data = this.tableDataSource.data.filter((item: T) => {
      return this.idExtractor(item) !== id;
    })
  }

  refreshItemRow(action: ApiActionsType, id: any, el: T) {
    super.refreshItemRow(action, id, el);
    switch (action) {
      case ApiActionsType.AddAction:
        this.tableDataSource.data.push(el);
        break;
      case ApiActionsType.UpdateAction:
        this.tableDataSource.data = this.tableDataSource.data.map((item: T) => {
          if (this.idExtractor(item) === this.idExtractor(el)) {
            return el;
          }
          return item;
        });
        break;
      case ApiActionsType.DeleteAction:
        this.tableDataSource.data = this.tableDataSource.data.filter((item: T) => {
          return this.idExtractor(item) !== this.idExtractor(el);
        })
        break;
      default:
        break;
    }
    /*const oldElement = this.tableDataSource.data.filter(t => {
      return this.idExtractor(t) === this.idExtractor(el)
    });
    const index = this.tableDataSource.data.indexOf(oldElement[0]);
    switch (action) {
      case ApiActionsType.AddAction:
        this.tableDataSource.data.push(el);
        break;
      case ApiActionsType.UpdateAction:
        this.tableDataSource.data.splice(index, 1, el);
        break;
      case ApiActionsType.DeleteAction:
        
        this.tableDataSource.data.splice(index, 1);
        break;      
      default:
        break;
    }*/

  }

}