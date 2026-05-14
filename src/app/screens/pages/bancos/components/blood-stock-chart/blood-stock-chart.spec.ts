import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodStockChart } from './blood-stock-chart';

describe('BloodStockChart', () => {
  let component: BloodStockChart;
  let fixture: ComponentFixture<BloodStockChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BloodStockChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodStockChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
