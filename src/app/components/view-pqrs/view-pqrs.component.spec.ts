import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPqrsComponent } from './view-pqrs.component';

describe('ViewPqrsComponent', () => {
  let component: ViewPqrsComponent;
  let fixture: ComponentFixture<ViewPqrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPqrsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPqrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
