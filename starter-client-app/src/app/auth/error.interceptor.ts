import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StarterAuthenticationService } from './starter-authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: StarterAuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401 || err.status === 0) {
                // auto logout if 401 response returned from api
                console.error(err);
                //this.authenticationService.logout();
            }
            const error = err.error.message || err.error || err.statusText;
            return throwError(error);
        }))
    }
}