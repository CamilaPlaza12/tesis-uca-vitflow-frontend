import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosTable } from './turnos-table';

describe('TurnosTable', () => {
  let component: TurnosTable;
  let fixture: ComponentFixture<TurnosTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurnosTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnosTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
