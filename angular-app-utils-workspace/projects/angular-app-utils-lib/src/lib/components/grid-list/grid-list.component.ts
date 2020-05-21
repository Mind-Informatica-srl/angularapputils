import { ListComponent } from '../list/list.component';
import { MatTableDataSource } from '@angular/material/table';


export abstract class GridListComponent<T, LoginInfo> extends ListComponent<T, LoginInfo> {
  
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
  
  onListLoaded(data: T[]){
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
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }

}