import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigProfileSecurityCard } from './config-profile-security-card';

describe('ConfigProfileSecurityCard', () => {
  let component: ConfigProfileSecurityCard;
  let fixture: ComponentFixture<ConfigProfileSecurityCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigProfileSecurityCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigProfileSecurityCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
