import { STARTER_ROUTES } from './routes/starter.routes';
import { AuthGuard } from './auth/auth.guard';
import { NavigationComponent } from './navigation/navigation.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'login',
      animation: "LoginPage"
    }
  },
  {
    path: '',
    component: NavigationComponent,
    data: {
      title: 'Starter Admin',
      animation: "NavigationPage"
    },
    children: STARTER_ROUTES,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
