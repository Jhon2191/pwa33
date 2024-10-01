import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackingTablePqrsComponent } from './tracking-table-pqrs.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PqrsService } from 'src/app/services/pqrs.service';
import { DATA_DUMMY, DATA_DUMMY_SERVICE } from 'src/app/data/data.tracking-table-pqrs.component.test';
import { MatDialog } from '@angular/material/dialog';
import { ViewPqrsComponent } from "../view-pqrs/view-pqrs.component";
import { FormRegisterPqrsComponent } from '../form-register-pqrs/form-register-pqrs.component';

describe('TrackingTablePqrsComponent', () => {
  let component: TrackingTablePqrsComponent;
  let fixture: ComponentFixture<TrackingTablePqrsComponent>;
  let pqrsService: PqrsService;
  let httpTestingController: HttpTestingController;
  let matDialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TrackingTablePqrsComponent,
        ViewPqrsComponent,
        FormRegisterPqrsComponent
      ],
      imports: [
        HttpClientTestingModule,
        MaterialModule, 
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TrackingTablePqrsComponent);
    component = fixture.componentInstance;
    pqrsService = TestBed.inject(PqrsService);
    httpTestingController = TestBed.inject(HttpTestingController);
    matDialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  /**
    * @author Fabian Duran
    * @createdate 2024-05-07
    * HU #1 Se debe visualizar una tabla sobre la tab seguimiento
  */
  it('Validar que el componente se monte sobre la tab seguimiento', () => {
    expect(component).toBeTruthy();
  });
  /**
    * @author Fabian Duran
    * @createdate 2024-05-07
    * HU #2 La tabla debe contener las columnas (Tipo de PQRS, Subtipo de PQRS, Fecha de radicación, Estado) y una columna final sin nombre
  */
  it('Validar que la tabla tenga las columnas correspondientes a los requerimientos', () => {
    const tableHeadersDom = fixture.nativeElement.querySelectorAll('.mat-header-cell');
    expect(tableHeadersDom.length).toBe(5);
    expect(tableHeadersDom[0].textContent).toContain('Tipo de PQRS');
    expect(tableHeadersDom[1].textContent).toContain('Subtipo de PQRS');
    expect(tableHeadersDom[2].textContent).toContain('Fecha de radicación');
    expect(tableHeadersDom[3].textContent).toContain('Estado');
    expect(tableHeadersDom[4].textContent).toContain('');
  });
  /**
    * @author Fabian Duran
    * @createdate 2024-05-07
    * HU #3 La tabla debe contener dos campos de busqueda con los nombres (Radicado, Código de seguridad)
    * El campo radicado debe ser de tipo numerico y el codigo de eguridad debe ser de tipo texto.
  */
  it('Validar que los dos campos de busqueda tengan los labels correspondintes', () => {
    const searchLabels = fixture.nativeElement.querySelectorAll('label');
    const filingNumberInput = fixture.nativeElement.querySelector('input[type="number"][data-placeholder="Numero de radicado"]');
    const securityCodeInput = fixture.nativeElement.querySelector('input[type="text"][data-placeholder="Código de seguridad"]');
    expect(searchLabels[0].textContent).toContain('Radicado');
    expect(searchLabels[1].textContent).toContain('Código de seguridad');    
    expect(filingNumberInput).toBeTruthy();
    expect(securityCodeInput).toBeTruthy();
  });
  /**
    * @author Fabian Duran
    * @createdate 2024-05-08
    * HU #4 El boton buscar debe estar deshabilitado cuando los dos campos del formulario estan vacios. 
  */
  it('Validar que el boton buscar este deshabilitado cuando los input radicado y codigo de seguridad esten vacios. Si no lo estan debe estar habilitado', () => {
    const buttonForm = fixture.nativeElement.querySelector('button');
    expect(buttonForm.disabled).toBeTrue();
    component.filingNumber = 33;
    component.securityCode = '7vCMnnuS';
    fixture.detectChanges();
    expect(buttonForm.disabled).toBeFalse();
  });
  /**
    * @author Fabian Duran
    * @createdate 2024-05-08
    * HU #5 Realizar la busqueda de la PQRS al dar click sobre el boton buscar. 
  */
  it('Validar la consulta de la PQRS mediante los parametros de busqueda', () => {
    component.filingNumber = 33;
    component.securityCode = '7vCMnnuS';
    component.onClickSearchPqrsExternal();
    const requestInfo = httpTestingController.expectOne(`http://localhost:8013/api/pqrs/external-show/33?verification_code=7vCMnnuS`);
    expect(requestInfo.request.method).toBe('GET');
    requestInfo.flush(DATA_DUMMY_SERVICE);
    fixture.detectChanges();
    const rowsDataTable = fixture.nativeElement.querySelectorAll('td');
    expect(rowsDataTable[0].textContent).toContain('Reclamo');
    expect(rowsDataTable[1].textContent).toContain('N/R');
    expect(rowsDataTable[2].textContent).toContain('07/05/2024 - 10:11');
    expect(rowsDataTable[3].textContent).toContain('Cerrado');
  });
  /**
    * @author Fabian Duran
    * @createdate 2024-05-13
    * HU #6 Se debe mostrar una modal con el detalle de la PQRS seleccionada. 
  */
  it('Validar que al dar click sobre el boton del registro se muestre la modal con el detalle de la PQRS', () => {
    spyOn(matDialog, 'open').and.callThrough();
    component.onClickButtonShow(DATA_DUMMY[0]);
    expect(matDialog.open).toHaveBeenCalled();    
  });
});
