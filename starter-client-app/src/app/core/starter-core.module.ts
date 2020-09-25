import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtAuthInterceptor } from '../auth/jwt-auth.interceptor';
import { ErrorInterceptor } from '../auth/error.interceptor';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { AauDateAdapter, UserMessageService, DataRefreshService, TitleService } from 'angular-app-utils-lib';


@NgModule({
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2000 } },//durata snackbar
        { provide: DateAdapter, useClass: AauDateAdapter },
        { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
        UserMessageService,
        DataRefreshService,
        TitleService
    ],
})
export class StarterCoreModule {
    constructor(private dateAdapter: DateAdapter<Date>) {
        this.dateAdapter.setLocale('it-IT');
    }
}
