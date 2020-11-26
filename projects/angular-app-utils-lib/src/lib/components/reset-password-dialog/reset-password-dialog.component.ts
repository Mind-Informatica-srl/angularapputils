import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidatorFn, FormGroup, ValidationErrors, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { UserMessageService, MessageType } from '../../services/user-message.service';

export interface ResetPwdDialogData {
  username: string;
  password: string;
  password2: string;
  oldPassword: string;
  pwdExpired: boolean;
  tempPassword: boolean
}

export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('password').value === formGroup.get('password2').value)
    return null;
  else
    return {passwordMismatch: true};
};

@Component({
  selector: 'app-reset-password-dialog',
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.scss']
})
export class ResetPasswordDialogComponent<LoginInfo> implements OnInit {

  _changeAllowed: boolean;
  minPw = 6;
  formGroup: FormGroup;
  waiting: boolean = false;
  tempPassword: boolean;//se true indica che stiamo modificando una password temporanea

  get changeAllowed(): boolean{
    return this._changeAllowed;
  }

  set changeAllowed(val: boolean){
    this._changeAllowed = val;
    if(val){
      this.dialogRef.disableClose = true;//si disabilita la chiusura della modal se si sta cambiando la password
    }
  }
  
  constructor(
    public dialogRef: MatDialogRef<ResetPasswordDialogComponent<LoginInfo>>,
    @Inject(MAT_DIALOG_DATA) public data: ResetPwdDialogData,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService<LoginInfo>,
    private userMessageService: UserMessageService) {
      this.changeAllowed = this.data.pwdExpired;//non si fa la domanda con cui si chiede all'utente se vuole resettare la password in caso sia obbligato a farlo
      this.tempPassword = this.authService.currentLoginInfoValue['TmpCrd']
    }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      username: [this.authService.currentLoginInfoValue['Username']],
      oldPassword: [''],
      password: ['', [Validators.required, Validators.minLength(this.minPw)]],
      password2: ['', [Validators.required]]
    }, {validator: passwordMatchValidator});
    if(!this.tempPassword){
      this.oldPassword.setValidators([Validators.required]);
    }
  }

  /* Shorthands for form controls (used from within template) */
  get username() { return this.formGroup.get('username'); }
  get password() { return this.formGroup.get('password'); }
  get password2() { return this.formGroup.get('password2'); }
  get oldPassword() { return this.formGroup.get('oldPassword'); }

  closeDialog(ok: boolean = false): void {
    this.dialogRef.close(ok);
  }

  /* Called on each input in either password field */
  onPasswordInput() {
    if (this.formGroup.hasError('passwordMismatch'))
      this.password2.setErrors([{'passwordMismatch': true}]);
    else
      this.password2.setErrors(null);
  }

  onSubmit(){
    if( this.username.value != null && this.password.value != null && (this.tempPassword || this.oldPassword.value != null) ){
      this.waiting = true;
      this.authService.resetPassword(this.formGroup.value).subscribe(res => {
        this.userMessageService.message({
          message: "Password modificata correttamente",
          messageType: MessageType.Info
        }); 
        this.waiting = false;      
        this.closeDialog(true);
      }, err =>{
        this.waiting = false;
        this.userMessageService.message({
          errorMessage: err,
          error: err
        });
      });
    }
  }

  logout(){
    this.authService.logout();
    this.closeDialog();
  }

}
