import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import {
  BloodType,
  ComponenteSanguineo,
  GrupoSanguineo,
  UnidadStock,
  UmbralStock,
} from '../../../models/blood-bank.model';
import { StockService } from '../../../service/stock_service';
import { COMPONENT_COLORS } from '../../../models/component-colors';
import { firstValueFrom } from 'rxjs';

const BLOOD_TYPES: GrupoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTES: ComponenteSanguineo[] = ['globulos_rojos', 'plasma', 'plaquetas'];

export interface ComponenteConfig {
  key: ComponenteSanguineo;
  label: string;
  labelCorto: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-bancos',
  standalone: false,
  templateUrl: './bancos.html',
  styleUrl: './bancos.scss',
})
export class Bancos implements OnInit {
  readonly bloodTypes = BLOOD_TYPES;

  readonly componentesConfig: ComponenteConfig[] = [
    {
      key: 'globulos_rojos',
      label: 'Glóbulos Rojos',
      labelCorto: 'Glóbulos',
      color: COMPONENT_COLORS.globulos_rojos.hex,
      icon: 'pi-heart-fill',
    },
    {
      key: 'plasma',
      label: 'Plasma',
      labelCorto: 'Plasma',
      color: COMPONENT_COLORS.plasma.hex,
      icon: 'pi-sun',
    },
    {
      key: 'plaquetas',
      label: 'Plaquetas',
      labelCorto: 'Plaquetas',
      color: COMPONENT_COLORS.plaquetas.hex,
      icon: 'pi-star-fill',
    },
  ];

  // Stock per component
  unidades: Record<ComponenteSanguineo, UnidadStock[]> = {
    globulos_rojos: [],
    plasma: [],
    plaquetas: [],
  };

  loadingComponent: Record<ComponenteSanguineo, boolean> = {
    globulos_rojos: false,
    plasma: false,
    plaquetas: false,
  };

  errorComponent: Record<ComponenteSanguineo, string> = {
    globulos_rojos: '',
    plasma: '',
    plaquetas: '',
  };

  // Umbrales
  umbrales: UmbralStock[] = [];
  loadingUmbrales = false;
  errorUmbrales = '';

  // Modal: Agregar stock
  addModalOpen = false;
  addModalComponente: ComponenteSanguineo | null = null;
  addBloodGroup: GrupoSanguineo = 'A+';
  addLoading = false;
  addError = '';

  // Modal: Quitar stock
  removeModalOpen = false;
  removeModalComponente: ComponenteSanguineo | null = null;
  removeBloodGroup: GrupoSanguineo = 'A+';
  removeSelectedId = '';
  removeLoading = false;
  removeError = '';

  // Modal: Historial
  historyModalOpen = false;
  historyModalComponente: ComponenteSanguineo | null = null;

  // Modal: Editar umbral
  editUmbralOpen = false;
  editUmbralItem: UmbralStock | null = null;
  editUmbralValue = 0;
  editUmbralLoading = false;
  editUmbralError = '';

  constructor(
    private stockService: StockService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    COMPONENTES.forEach((c) => this.loadComponente(c));
    this.loadUmbrales();
  }

  // ─── Load ──────────────────────────────────────────────────────────────────

  loadComponente(componente: ComponenteSanguineo): void {
    this.loadingComponent[componente] = true;
    this.errorComponent[componente] = '';

    this.stockService.getUnidadesDisponibles(componente).subscribe({
      next: (rows) => {
        this.zone.run(() => {
          this.unidades[componente] = rows ?? [];
          this.loadingComponent[componente] = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.errorComponent[componente] =
            err?.error?.detail || `Error cargando ${componente}`;
          this.loadingComponent[componente] = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  loadUmbrales(): void {
    this.loadingUmbrales = true;
    this.errorUmbrales = '';

    this.stockService.getUmbrales().subscribe({
      next: (rows) => {
        this.zone.run(() => {
          this.umbrales = rows ?? [];
          this.loadingUmbrales = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.errorUmbrales = err?.error?.detail || 'Error cargando umbrales';
          this.loadingUmbrales = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  // ─── Aggregation helpers ───────────────────────────────────────────────────

  countByGroup(componente: ComponenteSanguineo, grupo: GrupoSanguineo): number {
    return this.unidades[componente].filter((u) => u.blood_group === grupo).length;
  }

  totalByComponent(componente: ComponenteSanguineo): number {
    return this.unidades[componente].length;
  }

  // ─── Chart helpers ─────────────────────────────────────────────────────────

  stocksForChart(componente: ComponenteSanguineo): Record<BloodType, number> {
    const result: Record<string, number> = {};
    for (const bt of BLOOD_TYPES) {
      result[bt] = this.countByGroup(componente, bt);
    }
    return result as Record<BloodType, number>;
  }

  thresholdsForChart(componente: ComponenteSanguineo): Partial<Record<BloodType, number>> {
    const result: Partial<Record<BloodType, number>> = {};
    for (const bt of BLOOD_TYPES) {
      const umbral = this.getUmbral(componente, bt);
      if (umbral) result[bt as BloodType] = umbral.umbral_minimo;
    }
    return result;
  }

  // ─── Umbrales helpers ──────────────────────────────────────────────────────

  getUmbral(componente: ComponenteSanguineo, grupo: GrupoSanguineo): UmbralStock | null {
    return (
      this.umbrales.find((u) => u.componente === componente && u.blood_group === grupo) ?? null
    );
  }

  getUmbralValue(componente: ComponenteSanguineo, grupo: GrupoSanguineo): number {
    return this.getUmbral(componente, grupo)?.umbral_minimo ?? 0;
  }

  getStatusForGroup(
    componente: ComponenteSanguineo,
    grupo: GrupoSanguineo
  ): 'ok' | 'bajo' | 'critico' {
    const stock = this.countByGroup(componente, grupo);
    const thr = this.getUmbralValue(componente, grupo);
    if (!thr || thr <= 0) return 'ok';
    if (stock <= thr) return 'critico';
    if (stock <= thr * 1.3) return 'bajo';
    return 'ok';
  }

  statusLabel(s: 'ok' | 'bajo' | 'critico'): string {
    if (s === 'critico') return 'Crítico';
    if (s === 'bajo') return 'Bajo';
    return 'OK';
  }

  // ─── Remove modal: unidades selector ──────────────────────────────────────

  get removeUnidades(): UnidadStock[] {
    if (!this.removeModalComponente) return [];
    return this.unidades[this.removeModalComponente].filter(
      (u) => u.blood_group === this.removeBloodGroup
    );
  }

  onRemoveBloodGroupChange(): void {
    this.removeSelectedId = '';
  }

  // ─── Actions: Agregar ─────────────────────────────────────────────────────

  openAddModal(componente: ComponenteSanguineo): void {
    this.addModalComponente = componente;
    this.addBloodGroup = 'A+';
    this.addError = '';
    this.addLoading = false;
    this.addModalOpen = true;
  }

  closeAddModal(): void {
    this.addModalOpen = false;
    this.addModalComponente = null;
  }

  async confirmAdd(): Promise<void> {
    if (!this.addModalComponente || this.addLoading) return;

    this.addLoading = true;
    this.addError = '';

    try {
      await firstValueFrom(
        this.stockService.agregarUnidad(this.addModalComponente, {
          blood_group: this.addBloodGroup,
          turno_id: null,
          donante_id: null,
        })
      );
      this.closeAddModal();
      this.loadComponente(this.addModalComponente!);
    } catch (err: any) {
      this.addError = err?.error?.detail || 'Error al agregar la unidad.';
    } finally {
      this.addLoading = false;
    }
  }

  // ─── Actions: Quitar ──────────────────────────────────────────────────────

  openRemoveModal(componente: ComponenteSanguineo): void {
    this.removeModalComponente = componente;
    this.removeBloodGroup = 'A+';
    this.removeSelectedId = '';
    this.removeError = '';
    this.removeLoading = false;
    this.removeModalOpen = true;
  }

  closeRemoveModal(): void {
    this.removeModalOpen = false;
    this.removeModalComponente = null;
  }

  async confirmRemove(): Promise<void> {
    if (!this.removeModalComponente || !this.removeSelectedId || this.removeLoading) return;

    this.removeLoading = true;
    this.removeError = '';

    try {
      await firstValueFrom(
        this.stockService.retirarUnidad(this.removeModalComponente, this.removeSelectedId)
      );
      this.closeRemoveModal();
      this.loadComponente(this.removeModalComponente!);
    } catch (err: any) {
      this.removeError = err?.error?.detail || 'Error al retirar la unidad.';
    } finally {
      this.removeLoading = false;
    }
  }

  // ─── Actions: Historial ───────────────────────────────────────────────────

  openHistoryModal(componente: ComponenteSanguineo): void {
    this.historyModalComponente = componente;
    this.historyModalOpen = true;
  }

  closeHistoryModal(): void {
    this.historyModalOpen = false;
    this.historyModalComponente = null;
  }

  // ─── Actions: Umbral ──────────────────────────────────────────────────────

  openEditUmbral(umbral: UmbralStock): void {
    this.editUmbralItem = umbral;
    this.editUmbralValue = umbral.umbral_minimo;
    this.editUmbralError = '';
    this.editUmbralLoading = false;
    this.editUmbralOpen = true;
  }

  closeEditUmbral(): void {
    this.editUmbralOpen = false;
    this.editUmbralItem = null;
  }

  async confirmEditUmbral(): Promise<void> {
    if (!this.editUmbralItem || this.editUmbralLoading) return;

    const value = Math.max(0, Math.floor(Number(this.editUmbralValue || 0)));
    this.editUmbralLoading = true;
    this.editUmbralError = '';

    try {
      const updated = await firstValueFrom(
        this.stockService.updateUmbral(this.editUmbralItem.id, value)
      );
      const idx = this.umbrales.findIndex((u) => u.id === updated.id);
      if (idx !== -1) {
        this.umbrales[idx] = updated;
      } else {
        this.umbrales.push(updated);
      }
      this.closeEditUmbral();
      this.cdr.detectChanges();
    } catch (err: any) {
      this.editUmbralError = err?.error?.detail || 'Error al guardar el umbral.';
    } finally {
      this.editUmbralLoading = false;
    }
  }

  // ─── Utils ────────────────────────────────────────────────────────────────

  formatDate(iso: string): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  configFor(key: ComponenteSanguineo): ComponenteConfig {
    return this.componentesConfig.find((c) => c.key === key)!;
  }
}
