import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventosComponent } from './eventos';

const routes: Routes = [{ path: '', component: EventosComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventosRoutingModule {}
