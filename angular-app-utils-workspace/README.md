# Aggiornamento npm

incrementare il numero di versione in package.json in projects/angular-app-utils-lib

- Modificare il numero di versione in package.json all'interno
  di projects/angular-app-utils-lib/src/lib

- Eventualmente fare login :
  Vedi Authenticating with a personal access token
  https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry

- Eseguire i seguenti comandi posizionandosi prima nella cartella angular-app-utils-workspace

```
ng build angular-app-utils-lib --prod
cd dist/angular-app-utils-lib
npm publish
```
