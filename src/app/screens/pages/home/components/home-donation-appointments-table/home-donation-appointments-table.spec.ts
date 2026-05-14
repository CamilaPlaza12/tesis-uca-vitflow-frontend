import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDonationAppointmentsTable } from './home-donation-appointments-table';

describe('HomeDonationAppointmentsTable', () => {
  let component: HomeDonationAppointmentsTable;
  let fixture: ComponentFixture<HomeDonationAppointmentsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeDonationAppointmentsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDonationAppointmentsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
