import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeActiveRequestsTable } from './home-active-requests-table';

describe('HomeActiveRequestsTable', () => {
  let component: HomeActiveRequestsTable;
  let fixture: ComponentFixture<HomeActiveRequestsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeActiveRequestsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeActiveRequestsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
