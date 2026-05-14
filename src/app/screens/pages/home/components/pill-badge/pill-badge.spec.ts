import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PillBadge } from './pill-badge';

describe('PillBadge', () => {
  let component: PillBadge;
  let fixture: ComponentFixture<PillBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PillBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PillBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
