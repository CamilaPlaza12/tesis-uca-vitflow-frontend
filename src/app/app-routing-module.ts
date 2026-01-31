import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Home } from './screens/pages/home/home';
import { SignIn } from './screens/auth/sign-in/sign-in';
import { Register } from './screens/auth/register/register';
import { Bancos } from './screens/pages/bancos/bancos';
import { Turnos } from './screens/pages/turnos/turnos';
import { PedidosAlertas } from './screens/pages/pedidos-alertas/pedidos-alertas';
import { Configuracion } from './screens/pages/configuracion/configuracion';
import { EquipoRoles } from './screens/pages/equipos-roles/equipos-roles';
import { AuthGuard } from './service/auth_guard';
import { BackofficeRequests } from './backoffice/backoffice-requests/backoffice-requests';

const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },

  { path: 'signin', component: SignIn },
  { path: 'register', component: Register },
  { path: 'home', component: Home},
  { path: 'bancos', component: Bancos, canActivate: [AuthGuard] },
  { path: 'turnos', component: Turnos },
  { path: 'pedidos-alertas', component: PedidosAlertas },
  { path: 'configuracion', component: Configuracion, canActivate: [AuthGuard] },
  { path: 'equipo-roles', component: EquipoRoles },
  { path: 'backoffice', component: BackofficeRequests },


  { path: '**', redirectTo: 'signin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
