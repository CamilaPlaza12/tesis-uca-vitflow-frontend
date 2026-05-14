import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoDetail } from './turno-detail';

describe('TurnoDetail', () => {
  let component: TurnoDetail;
  let fixture: ComponentFixture<TurnoDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurnoDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnoDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
