import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CrearEncuestaComponent } from './components/crear-encuesta/crear-encuesta.component';
import { ResponderEncuestaComponent } from './components/responder-encuesta/responder-encuesta.component';
import { ListarEncuestasComponent } from './components/listar-encuestas/listar-encuestas.component';
import { EncuestaService } from './services/encuesta.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    CrearEncuestaComponent,
    ResponderEncuestaComponent,
    ListarEncuestasComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [EncuestaService],
  bootstrap: [AppComponent]
})
export class AppModule { }