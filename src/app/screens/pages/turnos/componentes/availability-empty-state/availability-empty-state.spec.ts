import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityEmptyState } from './availability-empty-state';

describe('AvailabilityEmptyState', () => {
  let component: AvailabilityEmptyState;
  let fixture: ComponentFixture<AvailabilityEmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvailabilityEmptyState]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilityEmptyState);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
