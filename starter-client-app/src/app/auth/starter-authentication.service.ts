import { Contenuto } from './../models/contenuto.model';
import { Ruolo } from './../models/ruolo.model';
import { Utente } from './../models/utente.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthenticationService } from 'angular-app-utils-lib';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscriber } from 'rxjs';



@Injectable({ providedIn: 'root' })
export class StarterAuthenticationService extends AuthenticationService<Utente> {

    constructor(http: HttpClient,
        public dialog: MatDialog) {
        super(http, environment.apiUrl);
        this.setContenutiUtente();
    }

    private _contenutiUtente: string[] = [];

    setContenutiUtente(): void {
        if (this.currentLoginInfoValue) {
            this._contenutiUtente = this.currentLoginInfoValue.Ruolo.Contenuti.map(el => {
                return el.CodContenuto;
            });
        } else {
            this._contenutiUtente = [];
        }
    }

    getContenutiUtente(): any[] {
        return this._contenutiUtente;
    }

    updateUser(user: Utente) {
        super.updateUser(user);
        this.setContenutiUtente();
    }

    //TODO rimuovere questo fake login
    login(username: string, password: string, remember: boolean): Observable<Utente> {
        const fakeUser = {
            Username: username,
            Cognome: 'Rossi',
            Nome: 'Mario',
            DataScadenza: new Date(2022, 10, 10),
            Descrizione: 'Utente prova',
            JwtToken: 'aaaa009876a5a5a6a7',
            RuoloId: 1,
            Ruolo: {
                Nome: 'Admin',
                Descrizione: 'Ruolo Test',
                Id: 1,
                Contenuti: [
                    {
                        CodContenuto: 'utenti',
                        Descrizione: 'contenuto utenti test'
                    } as Contenuto,
                    {
                        CodContenuto: 'utenti_modifica',
                        Descrizione: 'contenuto utenti_modifica test'
                    } as Contenuto,
                    {
                        CodContenuto: 'ruoli',
                        Descrizione: 'contenuto ruoli test'
                    } as Contenuto,
                    {
                        CodContenuto: 'ruoli_modifica',
                        Descrizione: 'contenuto ruoli_modifica test'
                    } as Contenuto,
                ]
            } as Ruolo
        } as Utente;
        this.updateUser(fakeUser);
        return new Observable<Utente>((subscriber: Subscriber<Utente>) => subscriber.next(fakeUser));
        //return Observable.of({} as Utente).map(o => JSON.stringify(o));
    }

}