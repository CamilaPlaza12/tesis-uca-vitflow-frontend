import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosCalendar } from './turnos-calendar';

describe('TurnosCalendar', () => {
  let component: TurnosCalendar;
  let fixture: ComponentFixture<TurnosCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurnosCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnosCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
