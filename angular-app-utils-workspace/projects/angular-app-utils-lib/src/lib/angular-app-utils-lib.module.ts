import { ForgotPasswordDialogComponent } from './components/forgot-password-dialog/forgot-password-dialog.component';
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
import { DetailDialogComponent } from './components/detail-dialog/detail-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { RicercaFieldDateComponent } from './components/ricerca/ricerca-field-date/ricerca-field-date.component';
import { RicercaFieldNumberComponent } from './components/ricerca/ricerca-field-number/ricerca-field-number.component';
import { RicercaFieldRadioComponent } from './components/ricerca/ricerca-field-radio/ricerca-field-radio.component';
import { RicercaFieldSelectComponent } from './components/ricerca/ricerca-field-select/ricerca-field-select.component';
import { RicercaFieldStringComponent } from './components/ricerca/ricerca-field-string/ricerca-field-string.component';
import { RicercaFormComponent } from './components/ricerca/ricerca-form/ricerca-form.component';
import { RicercaMenuComponent } from './components/ricerca/ricerca-menu/ricerca-menu.component';
import { HtmlContainerDialogComponent } from './components/html-container-dialog/html-container-dialog.component';
import { StampaFormComponent } from './components/stampa/stampa-form/stampa-form.component';
import { StampaModalComponent } from './components/stampa/stampa-modal/stampa-modal.component';


@NgModule({
  declarations: [
    AngularAppUtilsLibComponent,
    DateTimePickerComponent,
    ConfirmDialogComponent,
    PromptDialogComponent,
    ResetPasswordDialogComponent,
    ForgotPasswordDialogComponent,
    DetailDialogComponent,
    RicercaFormComponent,
    RicercaFieldStringComponent,
    RicercaFieldNumberComponent,
    RicercaFieldDateComponent,
    RicercaFieldSelectComponent,
    RicercaFieldRadioComponent,
    RicercaMenuComponent,
    HtmlContainerDialogComponent,
    StampaModalComponent,
    StampaFormComponent
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
    MatPaginatorModule,
    MatExpansionModule,
    MatMenuModule,
    MatSelectModule,
    MatRadioModule,
    DragDropModule
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
    ResetPasswordDialogComponent,
    ForgotPasswordDialogComponent,
    DetailDialogComponent,
    NgxMaterialTimepickerModule,
    RicercaFormComponent,
    RicercaFieldStringComponent,
    RicercaFieldNumberComponent,
    RicercaFieldDateComponent,
    RicercaFieldSelectComponent,
    RicercaFieldRadioComponent,
    RicercaMenuComponent,
    HtmlContainerDialogComponent,
    StampaModalComponent,
    StampaFormComponent
  ],
  entryComponents: [
    ConfirmDialogComponent,
    PromptDialogComponent,
    ResetPasswordDialogComponent,
    DetailDialogComponent,
    ForgotPasswordDialogComponent,
    HtmlContainerDialogComponent,
    StampaFormComponent
  ],
})
export class AngularAppUtilsLibModule { }
