import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Evento, CrearEventoDTO } from '../../../../../models/evento';
import { EventosService } from '../../../../../service/eventos_service';

function atLeastOneSelected(group: AbstractControl): ValidationErrors | null {
  const val = group.value as Record<string, boolean>;
  return Object.values(val).some((v) => v) ? null : { noneSelected: true };
}

interface TipoSanguineo {
  key: string;
  label: string;
  grupo: string;
  factor: string;
}

@Component({
  selector: 'app-crear-evento',
  standalone: false,
  templateUrl: './crear-evento.html',
  styleUrl: './crear-evento.scss',
})
export class CrearEventoComponent implements OnChanges {
  @Input() open = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() eventoCreado = new EventEmitter<Evento>();

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  readonly today = new Date().toISOString().split('T')[0];

  readonly tiposSanguineos: TipoSanguineo[] = [
    { key: 'A_pos', label: 'A+', grupo: 'A', factor: '+' },
    { key: 'A_neg', label: 'A−', grupo: 'A', factor: '-' },
    { key: 'B_pos', label: 'B+', grupo: 'B', factor: '+' },
    { key: 'B_neg', label: 'B−', grupo: 'B', factor: '-' },
    { key: 'AB_pos', label: 'AB+', grupo: 'AB', factor: '+' },
    { key: 'AB_neg', label: 'AB−', grupo: 'AB', factor: '-' },
    { key: 'O_pos', label: 'O+', grupo: 'O', factor: '+' },
    { key: 'O_neg', label: 'O−', grupo: 'O', factor: '-' },
  ];

  constructor(
    private fb: FormBuilder,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.resetForm();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      fecha: ['', [Validators.required]],
      hora_inicio: [''],
      hora_fin: [''],
      lugar: [''],
      capacidad_esperada: [null, [Validators.min(1)]],
      tipos: this.fb.group(
        {
          A_pos: [true],
          A_neg: [true],
          B_pos: [true],
          B_neg: [true],
          AB_pos: [true],
          AB_neg: [true],
          O_pos: [true],
          O_neg: [true],
        },
        { validators: atLeastOneSelected }
      ),
    });
  }

  private resetForm(): void {
    this.form.reset({
      nombre: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      lugar: '',
      capacidad_esperada: null,
      tipos: {
        A_pos: true,
        A_neg: true,
        B_pos: true,
        B_neg: true,
        AB_pos: true,
        AB_neg: true,
        O_pos: true,
        O_neg: true,
      },
    });
    this.error = null;
    this.loading = false;
  }

  get tiposGroup(): FormGroup {
    return this.form.get('tipos') as FormGroup;
  }

  onOverlay(): void {
    if (this.loading) return;
    this.cerrar.emit();
  }

  onCancel(): void {
    if (this.loading) return;
    this.cerrar.emit();
  }

  onSubmit(): void {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const tiposVal = val.tipos as Record<string, boolean>;

    const selectedTipos = this.tiposSanguineos.filter((t) => tiposVal[t.key]);
    const gruposSeleccionados = [...new Set(selectedTipos.map((t) => t.grupo))];
    const factoresSeleccionados = [...new Set(selectedTipos.map((t) => t.factor))];

    const body: CrearEventoDTO = {
      nombre: val.nombre.trim(),
      fecha: val.fecha,
      hora_inicio: val.hora_inicio?.trim() || null,
      hora_fin: val.hora_fin?.trim() || null,
      lugar: val.lugar?.trim() || null,
      capacidad_esperada: val.capacidad_esperada ? Number(val.capacidad_esperada) : null,
      grupos_sanguineos: gruposSeleccionados,
      factores_rh: factoresSeleccionados,
    };

    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.eventosService.crearEvento(body).subscribe({
      next: (evento) => {
        this.loading = false;
        this.eventoCreado.emit(evento);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        const status = err.status;
        if (status === 400 || status === 403) {
          const detail: string = err?.error?.detail || '';
          if (detail.toLowerCase().includes('hospital')) {
            this.error = 'Tu usuario no tiene hospital asociado';
          } else if (detail) {
            this.error = detail;
          } else {
            this.error = 'Datos inválidos. Revisá el formulario.';
          }
        } else {
          this.error = 'Error al crear el evento. Intentá de nuevo.';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
