import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CrearEncuestaComponent } from './components/crear-encuesta/crear-encuesta.component';
import { ResponderEncuestaComponent } from './components/responder-encuesta/responder-encuesta.component';
import { ListarEncuestasComponent } from './components/listar-encuestas/listar-encuestas.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'crear', component: CrearEncuestaComponent },
  { path: 'responder/:token', component: ResponderEncuestaComponent },
  { path: 'listar', component: ListarEncuestasComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }