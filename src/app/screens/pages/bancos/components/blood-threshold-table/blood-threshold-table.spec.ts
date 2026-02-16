import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodThresholdTable } from './blood-threshold-table';

describe('BloodThresholdTable', () => {
  let component: BloodThresholdTable;
  let fixture: ComponentFixture<BloodThresholdTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BloodThresholdTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodThresholdTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
