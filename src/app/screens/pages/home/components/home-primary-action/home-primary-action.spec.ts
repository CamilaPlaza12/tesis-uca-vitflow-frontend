import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePrimaryAction } from './home-primary-action';

describe('HomePrimaryAction', () => {
  let component: HomePrimaryAction;
  let fixture: ComponentFixture<HomePrimaryAction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePrimaryAction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePrimaryAction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
