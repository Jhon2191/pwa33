import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRegisterPqrsComponent } from './form-register-pqrs.component';

describe('FormRegisterPqrsComponent', () => {
  let component: FormRegisterPqrsComponent;
  let fixture: ComponentFixture<FormRegisterPqrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormRegisterPqrsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRegisterPqrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
