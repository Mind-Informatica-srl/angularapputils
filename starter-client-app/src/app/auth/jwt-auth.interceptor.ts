import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StarterAuthenticationService } from './starter-authentication.service';

@Injectable()
export class JwtAuthInterceptor implements HttpInterceptor {
    constructor(private authenticationService: StarterAuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with basic auth credentials if available
        const currentLoginInfo = this.authenticationService.currentLoginInfoValue;
        /*if(!environment.production){
            console.log(currentLoginInfo);
        }*/

        if (currentLoginInfo && currentLoginInfo.JwtToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentLoginInfo.JwtToken}`,
                    'Content-Type': 'application/json; charset=utf-8;',
                    'access-control-allow-origin': '*'
                }
            });
        }
        return next.handle(request);
    }
}