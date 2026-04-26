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
  { path: '', component: SignIn },

  { path: 'signin', component: SignIn },
  { path: 'register', component: Register },
  { path: 'home', component: Home},
  { path: 'bancos', component: Bancos, canActivate: [AuthGuard] },
  { path: 'turnos', component: Turnos, canActivate: [AuthGuard]  },
  { path: 'pedidos-alertas', component: PedidosAlertas, canActivate: [AuthGuard]  },
  { path: 'configuracion', component: Configuracion, canActivate: [AuthGuard] },
  { path: 'equipo-roles', component: EquipoRoles, canActivate: [AuthGuard]  },
  {
    path: 'eventos',
    loadChildren: () => import('./screens/pages/eventos/eventos.module').then(m => m.EventosModule),
    canActivate: [AuthGuard]
  },
  { path: 'backoffice', component: BackofficeRequests },


  { path: '**', redirectTo: 'signin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
