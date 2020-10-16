
export interface StampaFormConfig {

    ColumnNames: CampoStampaInterface[];
    SelectedColumnNames: CampoStampaInterface[];
    Formats: string[];
    SelectedFormat: string;
    LayoutApiUrl: string;
    Sezione: string;
    UtenteID: number | string;

}

export interface StampaUtenteFormConfig extends StampaFormConfig {

    Sezione: string;
    UtenteID: number | string;

}

export interface StampaInterface {

    Formato: string;
    Campi: CampoStampaInterface[];

}

/**
 * interfaccia utile per salvare su db
 */
export interface StampaUtente extends StampaInterface {

    ID?: number;
    Nome: string;
    Sezione: string;
    UtenteID: number;
    CreatedAt?: Date;
    UpdatedAt?: Date;

}

export interface CampoStampaInterface {

    Value: string;
    Description: string;

}

export interface StampaModalResponse {

    Formato: string;
    Campi: string[]
    Headers?: string[];

}