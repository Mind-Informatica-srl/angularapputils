import { Ruolo } from './ruolo.model';

export interface Utente {

    Username: string;

    Nome: string;

    Cognome: string;

    Descrizione: string;

    RuoloId: number;

    Ruolo: Ruolo;

    JwtToken: string;

    DataScadenza: Date;
}

/**
 * metodo per stabilire se le credenziali sono scadute o meno
 * @param dataScadenza data scadenza della password
 */
export function isExpired(dataScadenza: Date): boolean {
    const d = new Date(dataScadenza);
    const now = new Date();
    return now > d;
}