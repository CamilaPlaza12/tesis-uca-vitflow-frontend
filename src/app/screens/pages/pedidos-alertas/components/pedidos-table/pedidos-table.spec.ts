import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosTable } from './pedidos-table';

describe('PedidosTable', () => {
  let component: PedidosTable;
  let fixture: ComponentFixture<PedidosTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PedidosTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
