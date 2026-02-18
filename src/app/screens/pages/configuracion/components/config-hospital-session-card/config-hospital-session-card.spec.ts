import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigHospitalSessionCard } from './config-hospital-session-card';

describe('ConfigHospitalSessionCard', () => {
  let component: ConfigHospitalSessionCard;
  let fixture: ComponentFixture<ConfigHospitalSessionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigHospitalSessionCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigHospitalSessionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
