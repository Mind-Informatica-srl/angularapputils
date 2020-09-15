import { ResetPasswordComponent } from './shared/reset-password/reset-password.component';
import { NavigationComponent } from './navigation/navigation.component';
import { LoginComponent } from './login/login.component';
import { StarterCoreModule } from './core/starter-core.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularAppUtilsLibModule } from 'angular-app-utils-lib';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavigationComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: "ng-cli-universal" }),
    BrowserAnimationsModule,
    StarterCoreModule,//modulo con i providers
    AppRoutingModule,//modulo con le routes
    AngularAppUtilsLibModule,//modulo della libreria AngularAppUtilsLib
    HttpClientModule,
    SharedModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
