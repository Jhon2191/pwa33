import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeedDialFabComponent } from './pages/speed-dial-fab/speed-dial-fab.component';

const routes: Routes = [
  { path: '', redirectTo: 'external-pqrs', pathMatch: 'full' },
  { path: 'external-pqrs', component: SpeedDialFabComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
