
## Importazione della libreria in un progetto angular

Seguire i seguenti passi in ordine

0. eseguire il **checkout** di questo progetto
1. Aprire terminale o il terminale Visual Studio Code
2. Posizionarsi nella cartella **angular-app-utils-workspace**
3. **Eseguire** il seguente comando per avere la libreria compilata: ng build angular-app-utils-lib
4. Verrà così generata la cartella **dist** con i file da importare nel progetto
5. Aprire un progetto angular
6. **Eseguire** il comando per installare la dipendenza della libreria indicando come path quello della cartella dist generata: npm install ../../AngularAppUt/angular-app-utils-workspace/dist/angular-app-utils-lib
7. Si noterà quindi nel file package.json in dependencies il rigo: "angular-app-utils-lib": "file:../../AngularAppUtils/angular-app-utils-workspace/dist/angular-app-utils-lib",
8. In **tsconfig.json** in **compilerOptions** aggiungere quanto segue:
"paths": {
      "@angular/*": [
        "./node_modules/@angular/*"
      ]
}


---
