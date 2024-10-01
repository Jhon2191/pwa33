import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VicidialVozComponent } from './vicidial-voz.component';

describe('VicidialVozComponent', () => {
  let component: VicidialVozComponent;
  let fixture: ComponentFixture<VicidialVozComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VicidialVozComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VicidialVozComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
