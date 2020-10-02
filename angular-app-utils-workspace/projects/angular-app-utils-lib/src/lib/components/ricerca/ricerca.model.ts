import { MatSelect } from '@angular/material/select';
import { ElementRef } from '@angular/core';
import { MatInput } from '@angular/material/input';

export enum FilterFieldType {
    String,
    Date,
    Number,
    StaticSelect,
    DynamicSelect,
    StaticSelectNumber,
    DynamicSelectNumber,
    RadioString,
    RadioNumber,
    RadioBoolean
}

export interface FilterField {

    Name: string;
    Label: string;
    Type: FilterFieldType;
    StringValue?: string;
    //DateValue?: Date;
    //NumberValue?: number;
    UniqueId?: string;
    ApiUrl?: string;
    IDField?: string;
    DescriptionField?: string;
    list?: any[];
    actualFilterMap?: (fieldName: string, operator: string, value: any) => string;

}


export interface RicercaFieldChange {

    name: string;
    source: ElementRef | MatInput | MatSelect;
    value: any;

}

export interface FieldSelectOption {

    Label: string;
    Value: string;

}

export interface SimpleModel {

    ID: number | string;
    Description: string;

}