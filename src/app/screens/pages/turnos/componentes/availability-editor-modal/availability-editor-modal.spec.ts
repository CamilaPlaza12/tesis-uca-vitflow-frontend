import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityEditorModal } from './availability-editor-modal';

describe('AvailabilityEditorModal', () => {
  let component: AvailabilityEditorModal;
  let fixture: ComponentFixture<AvailabilityEditorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvailabilityEditorModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilityEditorModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
