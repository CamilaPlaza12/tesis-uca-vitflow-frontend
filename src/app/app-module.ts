import { SidebarComponent } from './screens/common/sidebar/sidebar';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
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
    Configuracion
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    RippleModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
