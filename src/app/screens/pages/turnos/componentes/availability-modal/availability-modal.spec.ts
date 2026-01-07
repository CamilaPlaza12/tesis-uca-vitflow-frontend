import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityModal } from './availability-modal';

describe('AvailabilityModal', () => {
  let component: AvailabilityModal;
  let fixture: ComponentFixture<AvailabilityModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvailabilityModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilityModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
