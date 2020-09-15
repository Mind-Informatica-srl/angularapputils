import { StarterAuthenticationService } from './starter-authentication.service';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: StarterAuthenticationService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, _: RouterStateSnapshot) {
        const currentLoginInfo = this.authenticationService.currentLoginInfoValue;
        if (currentLoginInfo) {
            const contenuti = route.data.roles;
            if (contenuti) {
                if (contenuti.length == 0 || this.authenticationService.isAuthorized(contenuti)) {
                    return true;
                } else {
                    //non siamo autorizzati per i contenuti che abbiamo a disposizione
                    return false;
                }
            }
            //altrimenti siamo autorizzati
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['login']);//{ queryParams: { returnUrl: state.url }}
        return false;
    }

}