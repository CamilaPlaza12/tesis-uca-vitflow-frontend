import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { EventosRoutingModule } from './eventos-routing.module';
import { EventosComponent } from './eventos';
import { DashboardEventoComponent } from './components/dashboard-evento/dashboard-evento';
import { RegistrarDonacionComponent } from './components/registrar-donacion/registrar-donacion';
import { PendientesClasificacionComponent } from './components/pendientes-clasificacion/pendientes-clasificacion';
import { CrearEventoComponent } from './components/crear-evento/crear-evento';

@NgModule({
  declarations: [
    EventosComponent,
    DashboardEventoComponent,
    RegistrarDonacionComponent,
    PendientesClasificacionComponent,
    CrearEventoComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EventosRoutingModule],
})
export class EventosModule {}
