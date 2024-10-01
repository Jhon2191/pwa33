import { TestBed } from '@angular/core/testing';
import { PqrsService } from './pqrs.service';
import { HttpClientModule } from '@angular/common/http';
import { DATA_DUMMY } from '../data/data.tracking-table-pqrs.component.test';

describe('PqrsService', () => {
  let service: PqrsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.inject(PqrsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  /**
    * @author Fabian Duran
    * @createdate 2024-05-10
    * HU #5 Realizar la busqueda de la PQRS llamando el servicio. 
  */
  it('Validar el llamado al servicio cuando se este consultando una PQRS', (done) => {
    service.searchPqrsExternal({ pqrsId: 33, verificationCode: '7vCMnnuS' }).subscribe(res => {
      expect(res).toEqual(DATA_DUMMY);
      expect(res.length).toEqual(1);
      done();
    });
  });
});
