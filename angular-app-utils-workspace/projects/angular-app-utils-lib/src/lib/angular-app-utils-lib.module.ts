import { ResetPasswordDialogComponent } from './components/reset-password-dialog/reset-password-dialog.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { NgModule } from '@angular/core';
import { AngularAppUtilsLibComponent } from './angular-app-utils-lib.component';
import { AauDateAdapter } from './adapters/aau-date-adapter';
import { DateAdapter } from '@angular/material/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { ItalianMatPaginatorIntl } from './utils/italian-mat-paginator-intl';


@NgModule({
  declarations: [
    AngularAppUtilsLibComponent,
    DateTimePickerComponent,
    ConfirmDialogComponent,
    PromptDialogComponent,
    ResetPasswordDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    NgxMaterialTimepickerModule.setLocale("it-IT"),
    LayoutModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    FlexLayoutModule,
    MatGridListModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: DateAdapter, useClass: AauDateAdapter },
    { provide: MatPaginatorIntl, useClass: ItalianMatPaginatorIntl }//per cambiare le label al paginator
  ],
  exports: [
    AngularAppUtilsLibComponent,
    DateTimePickerComponent,
    ConfirmDialogComponent,
    PromptDialogComponent,
    ResetPasswordDialogComponent
  ],
  entryComponents: [
    ConfirmDialogComponent,
    PromptDialogComponent,
    ResetPasswordDialogComponent
  ],
})
export class AngularAppUtilsLibModule { }
