import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalPqrsComponent } from './external-pqrs.component';

describe('ExternalPqrsComponent', () => {
  let component: ExternalPqrsComponent;
  let fixture: ComponentFixture<ExternalPqrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalPqrsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalPqrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
