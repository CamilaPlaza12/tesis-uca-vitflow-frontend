import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityConfig } from './availability-config';

describe('AvailabilityConfig', () => {
  let component: AvailabilityConfig;
  let fixture: ComponentFixture<AvailabilityConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvailabilityConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilityConfig);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
