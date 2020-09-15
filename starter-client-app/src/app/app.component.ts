import { StarterAuthenticationService } from './auth/starter-authentication.service';
import { Component, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AbstractAppComponent, UserMessageService } from 'angular-app-utils-lib';
import { environment } from 'src/environments/environment';
import { Utente } from './models/utente.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends AbstractAppComponent<Utente> {
  title = 'starter app';

  constructor(
    router: Router,
    authService: StarterAuthenticationService,
    userMessageService: UserMessageService,
    _snackBar: MatSnackBar) {
    super(router, authService, userMessageService, _snackBar);
  }

  ngOnInit() {
    super.ngOnInit();
    this.authService.currentLoginInfo
      .subscribe(loginInfo => {
        if (window.location.href.includes('/login')) {
          if (loginInfo != null) {
            this.router.navigate(['']);
          }
        } else {
          if (loginInfo == null) {
            this.router.navigate(['login']);
          } else {
            if (environment.production) {
              this.router.navigate(['']);
            }
          }
        }
      });
  }
  ngOnDestroy() {
    super.ngOnDestroy();
  }

  //resta in ascolto del beforeunload
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    super.unloadHandler(event);
    //event.returnValue = false;//TODO scommentare se si vuole mostrare all'utente il messaggio del browser che chiede conferma per chiudere la pagina
  }

  openSnackBar(message: string, action: string) {
    if (typeof (message) == 'string') {
      if (message.indexOf('duplicate key value violates unique constraint') > 0) {
        message = 'Errore Savetaggio: valore chiave duplicato';
      }
    } else {
      message = "Errore";
    }
    super.openSnackBar(message, action);
  }

}
