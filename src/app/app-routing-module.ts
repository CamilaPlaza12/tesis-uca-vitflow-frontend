import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './screens/pages/home/home';
import { SignIn } from './screens/auth/sign-in/sign-in';
import { Register } from './screens/auth/register/register';

const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: SignIn },
  { path: 'register', component: Register },
  { path: 'home', component: Home },
  { path: '**', redirectTo: 'signin' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
