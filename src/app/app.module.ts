import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './modules/material/material.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { AlertInterceptor } from './interceptors/alert.interceptor';
import { ExternalPqrsComponent } from './pages/external-pqrs/external-pqrs.component';
import { FormRegisterPqrsComponent } from './components/form-register-pqrs/form-register-pqrs.component';
import { TrackingTablePqrsComponent } from './components/tracking-table-pqrs/tracking-table-pqrs.component';
import { ViewPqrsComponent } from './components/view-pqrs/view-pqrs.component';
import { ManagementHistoryComponent } from './components/management-history/management-history.component';
import { SpeedDialFabComponent } from './pages/speed-dial-fab/speed-dial-fab.component';
import { VicidialVozComponent } from './components/vicidial-voz/vicidial-voz.component';
import { CallSummaryComponent } from './components/call-summary/call-summary.component';
import { SvgFeelingsComponent } from './components/svg-feelings/svg-feelings.component';
import { JwtModule } from '@auth0/angular-jwt';

@NgModule({
  declarations: [
    AppComponent,
    ExternalPqrsComponent,
    FormRegisterPqrsComponent,
    TrackingTablePqrsComponent,
    ViewPqrsComponent,
    ManagementHistoryComponent,
    SpeedDialFabComponent,
    VicidialVozComponent,
    CallSummaryComponent,
    SvgFeelingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxSpinnerModule.forRoot({ type: 'timer' }),
    HttpClientModule,
    ToastrModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: null,
        allowedDomains: [],
        disallowedRoutes: [],
      },
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AlertInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
