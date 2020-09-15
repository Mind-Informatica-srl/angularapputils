import { Contenuto } from './../../models/contenuto.model';
import { Ruolo } from './../../models/ruolo.model';
import { Utente } from '../../models/utente.model';

export const UTENTI_DUMMIES_DATA: Utente[] = [
    {
        Username: 'mario@rossi.it',
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
    }
];

export const RUOLI_DUMMIES_DATA: Ruolo[] = [
    {
        Id: 1,
        Nome: 'Admin',
        Descrizione: 'Admin test',
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
    },
    {
        Id: 2,
        Nome: 'Supervisore',
        Descrizione: 'Supervisore test',
        Contenuti: [
            {
                CodContenuto: 'utenti',
                Descrizione: 'contenuto utenti test'
            } as Contenuto,
            {
                CodContenuto: 'ruoli',
                Descrizione: 'contenuto ruoli test'
            } as Contenuto,
        ]
    }
];


export const CONTENUTI_DUMMIES_DATA: Contenuto[] = [
    {
        Nome: 'Utenti',
        CodContenuto: 'utenti',
        Descrizione: 'contenuto utenti test'
    } as Contenuto,
    {
        CodContenuto: 'utenti_modifica',
        Nome: 'Gestione utenti',
        Descrizione: 'contenuto utenti_modifica test'
    } as Contenuto,
    {
        CodContenuto: 'ruoli',
        Nome: 'Ruoli',
        Descrizione: 'contenuto ruoli test'
    } as Contenuto,
    {
        CodContenuto: 'ruoli_modifica',
        Nome: 'Gestione ruoli',
        Descrizione: 'contenuto ruoli_modifica test'
    } as Contenuto,
];