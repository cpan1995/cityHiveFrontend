import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { SmsPresentationComponent } from './components/sms/sms-presentation/sms-presentation.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
{ path: 'messenger', component: SmsPresentationComponent },
{ path: 'login', component: LoginComponent },
{ path: 'signup', component: SignupComponent },
{ path: 'home', component: HomeComponent },
{ path: '**', redirectTo: '/home' }
];
