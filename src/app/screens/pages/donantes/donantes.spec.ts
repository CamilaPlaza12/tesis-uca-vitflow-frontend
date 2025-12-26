import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Donantes } from './donantes';

describe('Donantes', () => {
  let component: Donantes;
  let fixture: ComponentFixture<Donantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Donantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Donantes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
