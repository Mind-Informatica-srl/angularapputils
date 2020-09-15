import { ResetPasswordComponent } from './../shared/reset-password/reset-password.component';
import { StarterAuthenticationService } from './../auth/starter-authentication.service';
import { TitleService, ResetPasswordDialogComponent } from 'angular-app-utils-lib';
import { Subscription } from 'rxjs';
import { routeAnimations } from 'src/app/shared/animations/route.animations';
import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterOutlet, Router } from '@angular/router';
import { isExpired, Utente } from '../models/utente.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  animations: [
    routeAnimations
  ]
})
export class NavigationComponent implements AfterViewInit, OnDestroy {

  titoloHeader: string;
  protected passwordSub: Subscription;
  protected sub: Subscription = new Subscription();

  constructor(protected authService: StarterAuthenticationService, public dialog: MatDialog, private titleService: TitleService, protected router: Router) {
    this.sub.add(this.titleService.title.subscribe((value) => {
      this.titoloHeader = value;
    }));
  }

  /**
    * Metodo per stabilire se si è autorizzati a navigare a un determinato path
    * @param permesso stringa contenente il permesso necessario
    */
  isAuthorizedToNavigate(permesso: string) {
    return this.authService.isAuthorized([permesso]);
  }

  ngAfterViewInit() {
    if (this.isPasswordExpired) {
      this.onChangePassword(true);
    }
  }

  get isPasswordExpired(): boolean {
    const user = this.utente;
    if (user) {
      return isExpired(user.DataScadenza);
    }
    return false;
  }

  get utente(): Utente {
    return this.authService.currentLoginInfoValue;
  }

  /**
   * restituisce le iniziali di nome e cognome utente loggato
   */
  get avatarName() {
    let nome: string;
    if (this.utente) {
      nome = this.utente.Nome.substring(0, 1) + this.utente.Cognome.substring(0, 1);
    } else {
      nome = "?";
    }
    return nome;
  }

  get userDescription() {
    let nome: string;
    if (this.utente) {
      nome = this.utente.Nome + " " + this.utente.Cognome;
    } else {
      nome = "?";
    }
    return nome;
  }

  onLogout() {
    this.authService.logout();
  }

  onChangePassword(forceOpen: boolean = false) {
    const loginInfo = this.utente;
    if (loginInfo != null) {
      let dialogRef = this.dialog.open(ResetPasswordComponent, {
        data: {
          pwdExpired: forceOpen,
        }
      });
      this.passwordSub = (dialogRef.afterClosed().subscribe((result: boolean) => {
        console.log('Reset Password dialog closed');
        if (result) {
          //si ricarica la pagina se è stata cambiata la password?
          //window.location.reload();
        }
      }));
    }
  }

  setTitoloHeader(value: string) {
    this.titoloHeader = value;
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  ngOnDestroy() {
    if (this.passwordSub) {
      this.passwordSub.unsubscribe();
    }
    this.sub.unsubscribe();
  }

}
