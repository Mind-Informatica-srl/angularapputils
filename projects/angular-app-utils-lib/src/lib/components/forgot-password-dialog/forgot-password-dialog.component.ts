import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from '../../services/authentication.service';
import { UserMessageService, MessageType } from '../../services/user-message.service';

@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.scss']
})
export class ForgotPasswordDialogComponent<LoginInfo> implements OnInit, OnDestroy {

  formGroup: FormGroup;
  waiting: boolean = false;
  get emailInputDialog() { return this.formGroup.get('emailInputDialog'); }
  private sub: Subscription = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordDialogComponent<LoginInfo>>,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService<LoginInfo>,
    private userMessageService: UserMessageService) {
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      emailInputDialog: ['', [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  closeDialog(ok: boolean = false): void {
    this.dialogRef.close(ok);
  }

  onSubmit() {
    if (this.emailInputDialog.value != null) {
      this.dialogRef.disableClose = true;
      this.waiting = true;
      this.sub.add(this.authService.forgotPassword(this.emailInputDialog.value).subscribe(res => {
        this.userMessageService.message({
          message: "Invio codice di verifica a " + this.emailInputDialog.value,
          messageType: MessageType.Info
        });
        this.waiting = false;
        this.dialogRef.disableClose = false;
        this.closeDialog(true);
      }, err => {
        this.waiting = false;
        this.dialogRef.disableClose = false;
        this.userMessageService.message({
          errorMessage: err,
          error: err
        });
      }));
    }
  }

}
