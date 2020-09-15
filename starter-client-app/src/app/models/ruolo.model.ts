import { Contenuto } from './contenuto.model';

export interface Ruolo {

    Id: number;

    Nome: string;

    Descrizione: string;

    Contenuti: Contenuto[];

}

export enum Role {
    User = 'User',
    Admin = 'Admin',

    Aziende = 'aziende',
    AziendeModifica = 'aziende_modifica',
    Utenti = 'utenti',
    UtentiModifica = 'utenti_modifica',
    SoloMedici = 'solo_medici',
    Ruoli = 'ruoli',
    RuoliModifica = 'ruoli_modifica',
    App = 'app',
    AppModifica = 'app_modifica',
    Eventi = 'eventi',
    EventiModifica = 'eventi_modifica',

}
