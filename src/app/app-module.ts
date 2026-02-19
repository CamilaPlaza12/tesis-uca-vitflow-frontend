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
import { Configuracion } from './screens/pages/configuracion/configuracion';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './interceptor/auth-token-interceptor';

import { PedidosTable } from './screens/pages/pedidos-alertas/components/pedidos-table/pedidos-table';
import { PedidoDetalle } from './screens/pages/pedidos-alertas/components/pedido-detalle/pedido-detalle';
import { CrearPedido } from './screens/pages/pedidos-alertas/components/crear-pedido/crear-pedido';
import { FormsModule } from '@angular/forms';
import { TurnosTable } from './screens/pages/turnos/componentes/turnos-table/turnos-table';
import { TurnosCalendar } from './screens/pages/turnos/componentes/turnos-calendar/turnos-calendar';
import { ConfirmModal } from './screens/common/confirm-modal/confirm-modal';
import { TurnoDetail } from './screens/pages/turnos/componentes/turno-detail/turno-detail';
import { AccionTurno } from './screens/pages/turnos/turno-actions.policy';
import { AvailabilityEmptyState } from './screens/pages/turnos/componentes/availability-empty-state/availability-empty-state';
import { AvailabilityConfig } from './screens/pages/turnos/componentes/availability-config/availability-config';
import { RegisterWizard } from './screens/auth/register/components/register-wizard/register-wizard';
import { Stepper } from './screens/auth/register/components/stepper/stepper';
import { HospitalStep } from './screens/auth/register/components/steps/hospital-step/hospital-step';
import { AdminStep } from './screens/auth/register/components/steps/admin-step/admin-step';
import { PlanStep } from './screens/auth/register/components/steps/plan-step/plan-step';
import { ReviewStep } from './screens/auth/register/components/steps/review-step/review-step';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ErrorModal } from './screens/common/error-modal/error-modal';
import { EquipoRoles } from './screens/pages/equipos-roles/equipos-roles';
import { MiembrosTable } from './screens/pages/equipos-roles/components/miembros-table/miembros-table';
import { SendValidationModal } from './screens/auth/register/components/send-validation-modal/send-validation-modal';
import { BackofficeRequests } from './backoffice/backoffice-requests/backoffice-requests';
import { BloodStockChart } from './screens/pages/bancos/components/blood-stock-chart/blood-stock-chart';
import { BloodThresholdTable } from './screens/pages/bancos/components/blood-threshold-table/blood-threshold-table';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { BloodManualActions } from './screens/pages/bancos/components/blood-manual-actions/blood-manual-actions';
import { HomeHeaderComponent } from './screens/pages/home/components/home-header/home-header';
import { HomeTopGridComponent } from './screens/pages/home/components/home-top-grid/home-top-grid';
import { HomeKpisComponent } from './screens/pages/home/components/home-kpis/home-kpis';
import { HomePrimaryActionComponent } from './screens/pages/home/components/home-primary-action/home-primary-action';
import { HomeDonationAppointmentsTableComponent } from './screens/pages/home/components/home-donation-appointments-table/home-donation-appointments-table';
import { HomeActiveRequestsTableComponent } from './screens/pages/home/components/home-active-requests-table/home-active-requests-table';
import { PillBadgeComponent } from './screens/pages/home/components/pill-badge/pill-badge';
import { ConfigProfileSecurityCard } from './screens/pages/configuracion/components/config-profile-security-card/config-profile-security-card';
import { ConfigHospitalSessionCard } from './screens/pages/configuracion/components/config-hospital-session-card/config-hospital-session-card';

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
    Configuracion,
    PedidosTable,
    PedidoDetalle,
    CrearPedido,
    TurnosTable,
    TurnosCalendar,
    ConfirmModal,
    TurnoDetail,
    AvailabilityEmptyState,
    AvailabilityConfig,
    RegisterWizard,
    Stepper,
    HospitalStep,
    AdminStep,
    PlanStep,
    ReviewStep,
    ErrorModal,
    EquipoRoles,
    MiembrosTable,
    SendValidationModal,
    BackofficeRequests,
    BloodStockChart,
    BloodThresholdTable,
    BloodManualActions,
    HomeHeaderComponent,
    HomeTopGridComponent,
    HomeKpisComponent,
    HomePrimaryActionComponent,
    HomeDonationAppointmentsTableComponent,
    HomeActiveRequestsTableComponent,
    PillBadgeComponent,
    ConfigProfileSecurityCard,
    ConfigHospitalSessionCard
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    RouterModule,
    RippleModule,
    HttpClientModule,
    ChartModule,
    DialogModule,
    InputNumberModule,
    TooltipModule,
    ToastModule
],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
