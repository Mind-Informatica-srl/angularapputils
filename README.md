
# Importazione della libreria in un progetto angular

Seguire i seguenti passi in ordine

0. eseguire il **checkout** di questo progetto
1. Aprire terminale o il terminale Visual Studio Code
2. Posizionarsi nella cartella **angular-app-utils-workspace**
3. **Eseguire** il seguente comando per avere la libreria compilata: npm run package
4. Verrà così generata la cartella **dist** ed il file .tgz da importare nel progetto
5. Aprire un progetto angular
6. **Eseguire** il comando per installare la dipendenza della libreria indicando come path quello del file .tgz nella cartella dist generata: npm install ../../AngularAppUtils/angular-app-utils-workspace/dist/angular-app-utils-lib/angular-app-utils-lib-0.0.1.tgz
7. Si noterà quindi nel file package.json in dependencies il rigo: "angular-app-utils-lib": "file:../../AngularAppUtils/angular-app-utils-workspace/dist/angular-app-utils/angular-app-utils-lib-0.0.1.tgz",
8. Potranno comparire dei messaggi di warning che possono chiedere di **installare alcune dipendenze** (vedi punti 10 e 11)
9. In **tsconfig.json** in **compilerOptions** aggiungere quanto segue in modo da dare sia alla libreria che al progetto che la importa un unico path per avere le librerie di angular necessarie:

"paths": {
      "@angular/*": [
        "./node_modules/@angular/*"
      ]
}

10. Il progetto che utilizza questa libreria deve avere installato anche **angular-material**

ng add @angular/material

11. e anche **angular-flex**

npm i -s @angular/flex-layout @angular/cdk

12. Nel progetto in **app.module.ts** importare il modulo della libreria

import { AngularAppUtilsLibModule } from 'angular-app-utils-lib';
  imports: [
    ...,  
    AngularAppUtilsLibModule
  ]


---

# Alternativa

Per fare la build della libreria, invece di eseguire 'npm run package' del punto 3, eseguire:

- ng build angular-app-utils-lib

Il primo comando è da usare rigorosamente per importare poi la libreria in un progetto: creerà oltre che la cartella dist, anche un file con estensione **.tgz**. Sarà questo che dovrà essere usato per l'installazione della libreria; Esempio:

- npm install ../../AngularAppUtils/angular-app-utils-workspace/dist/angular-app-utils-lib/angular-app-utils-lib-0.0.1.tgz

---

# NOTE

Le dipendenze da altre librerie @angular/* devono essere impostate come peer dependecies (questo dirà in fase di importazione della libreria, quali sono le altre librerie da importare per farla funzionare)
Vedi peerDependencies in package.json della libreria **dentro la cartella projects**

## Aggiunta di un un nuovo file

Ogni file/componente/service/altro da rendere disponibile ad altri progetti, oltre a dover essere configurato correttamente in angular-app-utils-lib.module.ts (dentro la cartella projects/lib), **dovrà essere anche esportato nel file public-api.ts**

---

## Per uleriori riferimenti vedere:
  utile: https://angular.io/guide/creating-libraries
  utile: https://medium.com/angular-in-depth/creating-a-library-in-angular-6-part-2-6e2bc1e14121

  https://github.com/angular/angular/issues/25813
  https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11
  https://indepth.dev/creating-a-library-in-angular-6-using-angular-cli-and-ng-packagr/


## Esempio di progetto che importa la libreria

**Pratiko** è il primo progetto che importa tale libreria

https://bitbucket.org/mindinformatica/pratiko/src/master/
