import { OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AuthenticationService, CURRENT_USER, CURRENT_USER_TO_DELETE } from '../../services/authentication.service';
import { UserMessageService, UserMessageData, MessageType } from '../../services/user-message.service';

export const CURRENT_USER_UPDATED = 'current-user-updated';

export abstract class AbstractAppComponent<LoginInfo> implements OnInit, OnDestroy {

  protected snackbarSubscription: Subscription;

  constructor(
    protected router: Router,
    protected authService: AuthenticationService<LoginInfo>,
    protected userMessageService: UserMessageService,
    protected _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    localStorage.removeItem(CURRENT_USER_UPDATED);
    this.snackbarSubscription = this.userMessageService.onMessage.subscribe((data: UserMessageData) => {
      this.onMessageReceived(data);
    });
  }

  protected onMessageReceived(data: UserMessageData) {
    if (data != null) {
      if (data.errorMessage || data.error) {
        this.openSnackBar(data.errorMessage || data.error || 'Errore!', "Errore");
      } else if (data.messageType == MessageType.Delete) {
        this.openSnackBar(((data.element && data.element.Description != null && data.element.Description != '') ? '"' + data.element.Description + '"' : 'Elemento') + ' cancellato con successo!', "Cancellato");
      } else if (data.messageType == MessageType.Insert) {
        this.openSnackBar(((data.element && data.element.Description != null && data.element.Description != '') ? '"' + data.element.Description + '"' : 'Elemento') + ' inserito con successo!', "Creazione");
      } else if (data.message) {
        switch (data.messageType) {
          case MessageType.Error:
            this.openSnackBar(data.message, "Errore");
            break;
          case MessageType.Warning:
            this.openSnackBar(data.message, "Attenzione");
            break;
          default:
            this.openSnackBar(data.message, "Info");
            break;
        }
      } else {
        this.openSnackBar('Modifica avvenuta con successo!', '');
      }
    }
  }

  ngOnDestroy() {
    if (this.snackbarSubscription) {
      this.snackbarSubscription.unsubscribe();
    }
  }

  /**
   * Impostazioni per la visualizzazione dello snackbar
   * Sovrascrivere per cambiarne il comportamento
   */
  protected snackbarOptions: MatSnackBarConfig<any> = {
    duration: 5000,
    horizontalPosition: "right"
  };

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, this.snackbarOptions);
  }

  //resta in ascolto del beforeunload
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    console.log("Processing beforeunload...");
    this.addUserToCache();
    //event.returnValue = false;//TODO scommentare se si vuole mostrare all'utente il messaggio del browser che chiede conferma per chiudere la pagina
  }

  /**
   * chiamato ad ogni cambiamento delle localStorage
   * @param ev evento contenente le informazioni del cambiamento registrato
   */
  @HostListener('window:storage', ['$event'])
  onStorageChange(ev: StorageEvent) {
    if (this.authService.currentLoginInfoValue && ev.key && ev.key == CURRENT_USER_UPDATED) {
      this.updateSessionUser(ev);
    }
  }

  protected updateSessionUser(ev: StorageEvent) {
    const newUserData: LoginInfo = JSON.parse(ev.newValue);
    if (this.authService.usernameExtractor(this.authService.currentLoginInfoValue) == this.authService.usernameExtractor(newUserData)) {
      const user = {
        ...this.authService.currentLoginInfoValue,
        ...newUserData
      }
      this.authService.updateUser(user);
    }
  }

  /**
   * aggiunge l'utente alle cache temporaneamente (utile per quando si ricarica la pagina)
   * l'AuthenticationService si occuperà di rimuovere questa localStorage a caricamento avvenuto
   */
  protected addUserToCache() {
    const userSaved = localStorage.getItem(CURRENT_USER);
    if (userSaved == null) {
      const user = this.authService.currentLoginInfoValue;
      if (user != null) {
        localStorage.setItem(CURRENT_USER_TO_DELETE, "true");
        localStorage.setItem(CURRENT_USER, JSON.stringify(user));
      }
    }
  }

}