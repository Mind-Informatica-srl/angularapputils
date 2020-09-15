import { StarterAuthenticationService } from './../../auth/starter-authentication.service';
import { Utente } from './../../models/utente.model';
import { ResetPasswordDialogComponent, ResetPwdDialogData, UserMessageService, AngularAppUtilsLibModule } from 'angular-app-utils-lib';
import { Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component } from '@angular/core';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent extends ResetPasswordDialogComponent<Utente> {

    constructor(
        dialogRef: MatDialogRef<ResetPasswordDialogComponent<Utente>>,
        @Inject(MAT_DIALOG_DATA) data: ResetPwdDialogData,
        formBuilder: FormBuilder,
        authService: StarterAuthenticationService,
        userMessageService: UserMessageService) {
        super(dialogRef, data, formBuilder, authService, userMessageService);
    }

}