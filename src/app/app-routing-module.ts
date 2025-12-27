import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Home } from './screens/pages/home/home';
import { SignIn } from './screens/auth/sign-in/sign-in';
import { Register } from './screens/auth/register/register';
import { Bancos } from './screens/pages/bancos/bancos';
import { Turnos } from './screens/pages/turnos/turnos';
import { PedidosAlertas } from './screens/pages/pedidos-alertas/pedidos-alertas';
import { Donantes } from './screens/pages/donantes/donantes';
import { Configuracion } from './screens/pages/configuracion/configuracion';

import { AuthGuard } from './service/auth_guard';

const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },

  { path: 'signin', component: SignIn },
  { path: 'register', component: Register },

  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'bancos', component: Bancos, canActivate: [AuthGuard] },
  { path: 'turnos', component: Turnos, canActivate: [AuthGuard] },
  { path: 'pedidos-alertas', component: PedidosAlertas, canActivate: [AuthGuard] },
  { path: 'donantes', component: Donantes, canActivate: [AuthGuard] },
  { path: 'configuracion', component: Configuracion, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'signin' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
