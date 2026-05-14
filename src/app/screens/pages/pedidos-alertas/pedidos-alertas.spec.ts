import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosAlertas } from './pedidos-alertas';

describe('PedidosAlertas', () => {
  let component: PedidosAlertas;
  let fixture: ComponentFixture<PedidosAlertas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PedidosAlertas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosAlertas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
