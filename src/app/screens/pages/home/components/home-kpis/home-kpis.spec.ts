import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeKpis } from './home-kpis';

describe('HomeKpis', () => {
  let component: HomeKpis;
  let fixture: ComponentFixture<HomeKpis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeKpis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeKpis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
