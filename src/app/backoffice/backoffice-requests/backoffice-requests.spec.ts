import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackofficeRequests } from './backoffice-requests';

describe('BackofficeRequests', () => {
  let component: BackofficeRequests;
  let fixture: ComponentFixture<BackofficeRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackofficeRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackofficeRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
