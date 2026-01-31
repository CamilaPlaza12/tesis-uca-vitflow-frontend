import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposRoles } from './equipos-roles';

describe('EquiposRoles', () => {
  let component: EquiposRoles;
  let fixture: ComponentFixture<EquiposRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EquiposRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposRoles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
