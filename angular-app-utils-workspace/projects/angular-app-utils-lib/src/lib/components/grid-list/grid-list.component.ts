import { ViewChild } from '@angular/core';
import { ListComponent } from '../list/list.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';


export abstract class GridListComponent<T, LoginInfo> extends ListComponent<T, LoginInfo> {
  
  protected sort: MatSort;
  protected paginator: MatPaginator;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
    }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  
  setDataSourceAttributes() {
    if(this.tableDataSource != null) {
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
    }
  }

  get tableDataSource(): MatTableDataSource<T> {
    return this.dataSource as MatTableDataSource<T>;
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    if(this.tableDataSource != null){
      this.tableDataSource.sort = this.sort;
    }
  }
  
  onItemLoaded(data: T[]){
    if(this.tableDataSource == null){
      this.dataSource = new MatTableDataSource(data);
      this.setCustomSort();
    }else{
      this.tableDataSource.data = data;
    }
    this.tableDataSource.sort = this.sort;
  }

  protected setCustomSort(): void {
  }

  applyFilter(event: Event): void{
    //non si chiama il super. Qui dataSource è di tipo MatTableDataSource e possiamo applicare il suo metodo "filter"
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
