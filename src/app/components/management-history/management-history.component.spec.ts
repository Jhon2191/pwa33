import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementHistoryComponent } from './management-history.component';

describe('ManagementHistoryComponent', () => {
  let component: ManagementHistoryComponent;
  let fixture: ComponentFixture<ManagementHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
