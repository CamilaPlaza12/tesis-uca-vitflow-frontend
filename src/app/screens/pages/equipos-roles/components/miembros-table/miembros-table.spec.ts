import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiembrosTable } from './miembros-table';

describe('MiembrosTable', () => {
  let component: MiembrosTable;
  let fixture: ComponentFixture<MiembrosTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiembrosTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiembrosTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
