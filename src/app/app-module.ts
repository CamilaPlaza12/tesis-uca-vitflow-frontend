import { SidebarComponent } from './screens/common/sidebar/sidebar';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Home } from './screens/pages/home/home';
import { SignIn } from './screens/auth/sign-in/sign-in';
import { Register } from './screens/auth/register/register';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';

import { Bancos } from './screens/pages/bancos/bancos';
import { Turnos } from './screens/pages/turnos/turnos';
import { PedidosAlertas } from './screens/pages/pedidos-alertas/pedidos-alertas';
import { Donantes } from './screens/pages/donantes/donantes';
import { Configuracion } from './screens/pages/configuracion/configuracion';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthTokenInterceptor } from './interceptor/auth-token-interceptor';

import { PedidosTable } from './screens/pages/pedidos-alertas/components/pedidos-table/pedidos-table';
import { PedidoDetalle } from './screens/pages/pedidos-alertas/components/pedido-detalle/pedido-detalle';
import { CrearPedido } from './screens/pages/pedidos-alertas/components/crear-pedido/crear-pedido';

@NgModule({
  declarations: [
    App,
    Home,
    SignIn,
    Register,
    SidebarComponent,
    Bancos,
    Turnos,
    PedidosAlertas,
    Donantes,
    Configuracion,
    PedidosTable,
    PedidoDetalle,
    CrearPedido
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    RippleModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
