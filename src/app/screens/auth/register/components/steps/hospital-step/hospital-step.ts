import { GeorefService, GeoItem } from '../../../../../../service/georef.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hospital-step',
  standalone: false,
  templateUrl: './hospital-step.html',
  styleUrl: './hospital-step.scss',
})
export class HospitalStep implements OnInit, OnDestroy {
  @Input() group!: FormGroup;

  fileName = '';

  // Data cache local
  allProvinces: GeoItem[] = [];
  allLocalidades: GeoItem[] = [];

  // Filtered lists (lo que se muestra)
  provinces: GeoItem[] = [];
  localidades: GeoItem[] = [];

  provOpen = false;
  locOpen = false;

  provLoading = false;
  locLoading = false;

  private sub = new Subscription();

  constructor(private geo: GeorefService) {}

  ngOnInit(): void {
    this.setAddressEnabledState();

    // ✅ Preload provincias 1 sola vez
    this.provLoading = true;
    this.sub.add(
      this.geo.getProvinces().subscribe({
        next: (list) => {
          this.allProvinces = list;
          this.provLoading = false;

          // Si ya había texto (hardcode / autofill), filtramos
          const current = String(this.group.get('address.province')?.value ?? '');
          this.provinces = this.filterLocal(this.allProvinces, current);
        },
        error: () => {
          this.provLoading = false;
          this.allProvinces = [];
          this.provinces = [];
        },
      })
    );

    // Cuando cambia provinceId: reset + preload localidades de esa provincia
    this.sub.add(
      this.group.get('address.provinceId')!.valueChanges.subscribe((pid) => {
        this.resetLocalidad();
        this.setAddressEnabledState();

        const provinceId = String(pid ?? '');
        if (!provinceId) return;

        this.locLoading = true;
        this.sub.add(
          this.geo.getLocalidadesByProvincia(provinceId).subscribe({
            next: (list) => {
              this.allLocalidades = list;
              this.locLoading = false;

              const current = String(this.group.get('address.localidad')?.value ?? '');
              this.localidades = this.filterLocal(this.allLocalidades, current);
            },
            error: () => {
              this.locLoading = false;
              this.allLocalidades = [];
              this.localidades = [];
            },
          })
        );
      })
    );

    // Cuando cambia localidadId: habilitamos resto
    this.sub.add(
      this.group.get('address.localidadId')!.valueChanges.subscribe(() => {
        this.setAddressEnabledState();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ---------------------------
  // Logo
  // ---------------------------
  onLogoSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.group.get('logoFile')?.setValue(file);
    this.group.get('logoFile')?.markAsTouched();
    this.fileName = file?.name ?? '';
  }

  clearLogo(input: HTMLInputElement): void {
    input.value = '';
    this.group.get('logoFile')?.setValue(null);
    this.group.get('logoFile')?.markAsTouched();
    this.fileName = '';
  }

  // ---------------------------
  // Dígitos
  // ---------------------------
  onlyDigits(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const cleaned = (input.value || '').replace(/\D+/g, '');
    if (input.value !== cleaned) input.value = cleaned;

    const name = input.getAttribute('formControlName');
    if (name) this.group.get(`address.${name}`)?.setValue(cleaned, { emitEvent: true });
  }

  onlyPhoneDigits(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const cleaned = (input.value || '').replace(/\D+/g, '');
    if (input.value !== cleaned) input.value = cleaned;

    this.group.get('phone')?.setValue(cleaned, { emitEvent: true });
    this.group.get('phone')?.markAsTouched();
  }

  // ---------------------------
  // Provincia: instant (filter local)
  // ---------------------------
  onProvinceFocus(): void {
    this.provOpen = true;
    const v = String(this.group.get('address.province')?.value ?? '');
    this.provinces = this.filterLocal(this.allProvinces, v);
  }

  onProvinceInput(ev: Event): void {
    const v = String((ev.target as HTMLInputElement).value ?? '');

    // Si escribe, invalidamos selección previa
    this.group.get('address.provinceId')?.setValue('', { emitEvent: true });
    this.group.get('address.province')?.setValue(v, { emitEvent: false });

    this.resetLocalidad();
    this.setAddressEnabledState();

    // ✅ dropdown instantáneo
    this.provOpen = true;
    this.provinces = this.filterLocal(this.allProvinces, v);
  }

  selectProvince(p: GeoItem): void {
    this.group.get('address.province')?.setValue(p.nombre, { emitEvent: true });
    this.group.get('address.provinceId')?.setValue(p.id, { emitEvent: true });

    this.group.get('address.province')?.markAsTouched();
    this.group.get('address.provinceId')?.markAsTouched();

    this.provOpen = false;
    this.provinces = [];
  }

  onProvinceBlur(): void {
    const id = String(this.group.get('address.provinceId')?.value ?? '');
    if (!id) this.group.get('address.provinceId')?.setErrors({ required: true });
    setTimeout(() => (this.provOpen = false), 120);
  }

  // ---------------------------
  // Localidad: instant (filter local cache por provincia)
  // ---------------------------
  onLocalidadFocus(): void {
    this.locOpen = true;
    const v = String(this.group.get('address.localidad')?.value ?? '');
    this.localidades = this.filterLocal(this.allLocalidades, v);
  }

  onLocalidadInput(ev: Event): void {
    const v = String((ev.target as HTMLInputElement).value ?? '');

    this.group.get('address.localidadId')?.setValue('', { emitEvent: true });
    this.group.get('address.localidad')?.setValue(v, { emitEvent: false });

    // ✅ dropdown instantáneo
    this.locOpen = true;
    this.localidades = this.filterLocal(this.allLocalidades, v);
  }

  selectLocalidad(l: GeoItem): void {
    this.group.get('address.localidad')?.setValue(l.nombre, { emitEvent: true });
    this.group.get('address.localidadId')?.setValue(l.id, { emitEvent: true });

    this.group.get('address.localidad')?.markAsTouched();
    this.group.get('address.localidadId')?.markAsTouched();

    this.locOpen = false;
    this.localidades = [];
  }

  onLocalidadBlur(): void {
    const id = String(this.group.get('address.localidadId')?.value ?? '');
    if (!id) this.group.get('address.localidadId')?.setErrors({ required: true });
    setTimeout(() => (this.locOpen = false), 120);
  }

  // ---------------------------
  // Enable/Disable chain
  // ---------------------------
  private setAddressEnabledState(): void {
    const addr = this.group.get('address') as FormGroup;

    const provinceId = String(addr.get('provinceId')?.value ?? '');
    const localidadId = String(addr.get('localidadId')?.value ?? '');

    const loc = addr.get('localidad');
    const locId = addr.get('localidadId');

    if (provinceId) {
      loc?.enable({ emitEvent: false });
      locId?.enable({ emitEvent: false });
    } else {
      loc?.disable({ emitEvent: false });
      locId?.disable({ emitEvent: false });
    }

    const city = addr.get('city');
    const street = addr.get('street');
    const number = addr.get('number');

    if (localidadId) {
      city?.enable({ emitEvent: false });
      street?.enable({ emitEvent: false });
      number?.enable({ emitEvent: false });
    } else {
      city?.disable({ emitEvent: false });
      street?.disable({ emitEvent: false });
      number?.disable({ emitEvent: false });
    }
  }

  private resetLocalidad(): void {
    const addr = this.group.get('address') as FormGroup;

    addr.get('localidad')?.setValue('', { emitEvent: true });
    addr.get('localidadId')?.setValue('', { emitEvent: true });

    addr.get('city')?.setValue('', { emitEvent: true });
    addr.get('street')?.setValue('', { emitEvent: true });
    addr.get('number')?.setValue('', { emitEvent: true });

    this.allLocalidades = [];
    this.localidades = [];
    this.locOpen = false;
  }

  private filterLocal(list: GeoItem[], query: string): GeoItem[] {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return list.slice(0, 20);

    // Incluye búsqueda “contiene”
    return list
      .filter((x) => x.nombre.toLowerCase().includes(q))
      .slice(0, 20);
  }
}
