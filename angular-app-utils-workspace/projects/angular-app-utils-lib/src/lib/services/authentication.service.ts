import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { ApiDatasource } from "../api-datasource/api-datasource";
import { ResetPwdDialogData } from "../components/reset-password-dialog/reset-password-dialog.component";

export const CURRENT_USER: string = "CURRENT_USER";
export const TOKEN_OTP: string = "TOKEN_OTP";
export const CURRENT_USER_TO_DELETE: string = "CURRENT_USER_TO_DELETE";
export const LOGIN_CANDIDATE: string = "LOGIN_CANDIDATE";

//@Injectable({ providedIn: 'root' })
export abstract class AuthenticationService<LoginInfo> {
  protected currentLoginInfoSubject: BehaviorSubject<LoginInfo>;
  public currentLoginInfo: Observable<LoginInfo>;
  protected httpHeaders: HttpHeaders;

  usernameExtractor: (arg0: any) => any = (element: any) => element.Username;

  constructor(protected http: HttpClient, protected apiUrl: string) {
    const candidate = JSON.parse(localStorage.getItem(LOGIN_CANDIDATE));
    if(candidate) {
        this.login(candidate.Username, candidate.Password, true).subscribe();
    }
    this.currentLoginInfoSubject = new BehaviorSubject<LoginInfo>(
      JSON.parse(localStorage.getItem(CURRENT_USER))
    );
    if (localStorage.getItem(CURRENT_USER_TO_DELETE)) {
      this.removeUserFromCache();
    }
    this.currentLoginInfo = this.currentLoginInfoSubject.asObservable();
    this.httpHeaders = this.prepareHttpHeaders();
  }

  abstract getContenutiUtente(): any[];

  protected prepareHttpHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8;",
      "access-control-allow-origin": "*",
    });
  }

  public get currentLoginInfoValue(): LoginInfo {
    return this.currentLoginInfoSubject.value;
  }

  public get userId(): number | string {
    if (this.currentLoginInfoValue != null) {
      return this.currentLoginInfoValue["ID"];
    }
    return null;
  }

  /**
   * metodo per stabilire se l'utente loggato ha i contenuti con codici in codContenuti
   * @param codContenuti array di codici contenuto
   * @param searchAll boolean se true, si controlla che tutti i codContenuti siano presenti, altrimenti di default si cerca se ce n'è almeno uno
   */
  public isAuthorized(
    codContenuti: string[],
    searchAll: boolean = false
  ): boolean {
    if (
      codContenuti != null &&
      codContenuti.length > 0 &&
      this.currentLoginInfoValue != null
    ) {
      const contenutiUtente = this.getContenutiUtente();
      if (contenutiUtente == null) {
        return false;
      }
      if (searchAll) {
        return codContenuti.every((v) => contenutiUtente.includes(v)); //controlla se li contiene tutti
      }
      return contenutiUtente.some((r) => codContenuti.indexOf(r) >= 0); //controlla se contiene almeno uno
    } else {
      return false;
    }
  }

  /**
   * Metodo chiamato per ricevere la one-time-password dal server
   * //Torna un Observable di LoginInfo o boolean (true se è un utente)
   * @param username username di accesso
   * @param password propria password personale
   */
  askForOTP(
    username: string,
    password: string,
    retry: boolean = true
  ): Observable<LoginInfo | boolean> {
    let params = {
      Username: username,
      Password: password,
    };
    const token = localStorage.getItem(TOKEN_OTP + "_" + username);
    //se ad un precedente login era stato impostato il browser come sicuro
    if (token != null && token != "#") {
      params["SafePlace"] = true;
      params["TempSecret"] = token;
    }
    return this.http
      .post<LoginInfo>(`${this.apiUrl}login/otp`, params, {
        headers: this.httpHeaders,
      })
      .pipe(
        catchError((err) => {
          console.error(err);
          if (
            retry &&
            err.includes("codice temporaneo non valido") &&
            token != null &&
            token != ""
          ) {
            localStorage.removeItem(TOKEN_OTP + "_" + username);
            return this.askForOTP(username, password, false);
            //return throwError("codice temporaneo scaduto");
          }
          return throwError(err);
        })
      );
  }

  /**
   * Metodo per fare login al gestionale con la one-time-password ricevuta
   * @param username username di autenticazione
   * @param password propria password personale
   * @param secret otp ricevuta
   * @param remember se si salva l'utente in localStorage
   */
  loginWithOtp(
    username: string,
    password: string,
    secret: string,
    remeberBrowser: boolean
  ): Observable<LoginInfo> {
    return this.http
      .post<LoginInfo>(
        `${this.apiUrl}login`,
        {
          Username: username,
          Password: password,
          TempSecret: secret,
          SafePlace: remeberBrowser,
        },
        { headers: this.httpHeaders }
      )
      .pipe(catchError(ApiDatasource.handleError))
      .pipe(
        tap((loginInfo: LoginInfo) => {
          //si salva la scelta che stabilisce se il browser dell'utente è sicuro o meno
          localStorage.setItem(
            TOKEN_OTP + "_" + username,
            remeberBrowser ? secret : "#"
          );
          this.updateUser(loginInfo);
        })
      );
  }

  logout() {
    // remove Utente from local storage to log Utente out
    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(LOGIN_CANDIDATE);
    this.currentLoginInfoSubject.next(null);
  }

  resetPassword(data: ResetPwdDialogData): Observable<LoginInfo> {
    return this.http
      .post<LoginInfo>(
        `${this.apiUrl}login/resetpwd`,
        {
          Email: data.username,
          OldPassword: data.oldPassword,
          Password: data.password,
        },
        { headers: this.httpHeaders }
      )
      .pipe(
        map((utente) => {
          if (localStorage.getItem(CURRENT_USER) != null) {
            localStorage.removeItem(CURRENT_USER);
            //localStorage.setItem(CURRENT_USER, JSON.stringify(utente));
          }
          localStorage.removeItem(LOGIN_CANDIDATE);
          this.currentLoginInfoSubject.value["DataScadenza"] =
            utente["DataScadenza"];
          this.currentLoginInfoSubject.value["TmpCrd"] = utente["TmpCrd"];
          return utente;
        })
      );
  }

  forgotPassword(username: string): Observable<boolean> {
    const param = `username=${username}`;
    return this.http.post<boolean>(
      `${this.apiUrl}login/forgotpwd?${param}`,
      null,
      { headers: this.httpHeaders }
    );
  }

  resetTemporaryPassword(username: string): Observable<ResetPwdData> {
    const param = `username=${username}`;
    return this.http.post<ResetPwdData>(
      `${this.apiUrl}login/tmpcrd?${param}`,
      null,
      { headers: this.httpHeaders }
    );
  }

  updateUser(utente: LoginInfo) {
    this.currentLoginInfoSubject.next(utente);
  }

  //rimuove l'utente dalle cache
  private removeUserFromCache() {
    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(LOGIN_CANDIDATE);
    localStorage.removeItem(CURRENT_USER_TO_DELETE);
  }

  login(username: string, password: string, remember: boolean) {
    return this.http
      .post<LoginInfo>(`${this.apiUrl}login`, { username, password })
      .pipe(
        map((user) => {
          if (remember) {
            localStorage.setItem(LOGIN_CANDIDATE, JSON.stringify({
                Username: username,
                Password: password
            }));
          }
          this.updateUser(user);
          return user;
        })
      );
  }
}

export interface ResetPwdData {
  Response: Response;
  Error: string;
}

export interface Response {
  Title: string;
  Body: string;
  Style: string;
}
