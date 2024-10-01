import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallSummaryComponent } from './call-summary.component';

describe('CallSummaryComponent', () => {
  let component: CallSummaryComponent;
  let fixture: ComponentFixture<CallSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
