import { StarterAuthenticationService } from './../auth/starter-authentication.service';
import { routeAnimations } from './../shared/animations/route.animations';
import { Utente } from './../models/utente.model';
import { Component, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from 'angular-app-utils-lib';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    routeAnimations
  ]
})
export class LoginComponent implements OnDestroy {

  message: string;
  passwordVisibility: boolean = false;
  candidate: any;
  submitting: boolean = false;

  @ViewChild('usernameInput', { static: false }) usernameRef: ElementRef;
  @ViewChild('passwordInput', { static: false }) passwordRef: ElementRef;

  private sub: Subscription = new Subscription();

  constructor(private authService: StarterAuthenticationService, public dialog: MatDialog) {

  }

  private _remember: boolean = false;

  set remember(val: boolean) {
    this._remember = val;
  }

  get remember(): boolean {
    return this._remember;
  }

  onSubmit() {
    this.submitting = true;
    this.message = null;

    //richiesta per avere la one-time-password
    let username = (this.usernameRef.nativeElement as HTMLFormElement).value;
    let password = (this.passwordRef.nativeElement as HTMLFormElement).value;
    this.sub.add(this.authService.login(username, password, this.remember).subscribe((user: Utente) => {
      this.submitting = false;
    }, (error) => {
      this.submitting = false;
      //si gestisce errore ricevuto dal server
      console.log(error);
      this.message = "Errore di autenticazione";
      //this.message = error; //"Errore di autenticazione";
    }));

  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    event.preventDefault();
    if (this.dialog.openDialogs.length == 0) {
      this.onSubmit();
    }
  }

  //apre finestra modale in cui l'utente deve inserire la propria email.
  //Una volta inserita l'email, con un pulsante di conferma, viene chiamato il metodo per chiedere reimpostazione password
  onForgotPassword() {
    this.dialog.open(ForgotPasswordDialogComponent, {
    });
  }

  ngOnDestroy(): void {
    if (this.sub != null) {
      this.sub.unsubscribe();
    }
  }

}
