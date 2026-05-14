import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendValidationModal } from './send-validation-modal';

describe('SendValidationModal', () => {
  let component: SendValidationModal;
  let fixture: ComponentFixture<SendValidationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SendValidationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendValidationModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
