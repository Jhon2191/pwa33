import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgFeelingsComponent } from './svg-feelings.component';

describe('SvgFeelingsComponent', () => {
  let component: SvgFeelingsComponent;
  let fixture: ComponentFixture<SvgFeelingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvgFeelingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgFeelingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
