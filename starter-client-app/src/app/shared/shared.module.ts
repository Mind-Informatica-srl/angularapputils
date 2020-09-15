import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { StarterMaterialModule } from "../core/starter-material.module";


@NgModule({
    imports: [
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        CommonModule,
        StarterMaterialModule,//modulo con tutti gli import per angular-material
    ],
    exports: [
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        CommonModule,
        StarterMaterialModule,

    ],
    declarations: [
        //TODO valutare se la dichiarazione di utentiComponent e utenteDetailComponent vada fatta qui (qualora tali componenti fossero necessari in altri moduli)
    ],
    entryComponents: [

    ]
})
export class SharedModule { }