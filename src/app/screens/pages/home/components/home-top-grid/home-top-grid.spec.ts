import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTopGrid } from './home-top-grid';

describe('HomeTopGrid', () => {
  let component: HomeTopGrid;
  let fixture: ComponentFixture<HomeTopGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeTopGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeTopGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
