import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventosService } from '../../../../../service/eventos_service';

type ToastKind = 'success' | 'error';

@Component({
  selector: 'app-registrar-donacion',
  standalone: false,
  templateUrl: './registrar-donacion.html',
  styleUrl: './registrar-donacion.scss',
})
export class RegistrarDonacionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() eventoId!: string;
  @Output() donacionRegistrada = new EventEmitter<void>();

  @ViewChild('dniInput') dniInputRef!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  loading = false;
  dniDuplicado = false;

  toastOpen = false;
  toastText = '';
  toastKind: ToastKind = 'success';
  private toastTimer: any = null;

  constructor(
    private fb: FormBuilder,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    });
  }

  ngAfterViewInit(): void {
    this.dniInputRef?.nativeElement?.focus();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  get dniCtrl() {
    return this.form.get('dni');
  }

  onRegistrar(): void {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dniDuplicado = false;
    this.loading = true;
    this.cdr.detectChanges();

    const dniValue: string = this.form.value.dni;

    this.eventosService.registrarDonacion(this.eventoId, dniValue).subscribe({
      next: (res) => {
        this.loading = false;
        const label = res.donante_nombre || res.donante_dni;
        this.showToast(`Donación registrada — ${label}`, 'success');
        this.form.reset();
        this.donacionRegistrada.emit();
        this.cdr.detectChanges();
        setTimeout(() => this.dniInputRef?.nativeElement?.focus(), 50);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400) {
          this.dniDuplicado = true;
        } else if (err.status === 404) {
          this.showToast('No se encontró el evento', 'error');
        } else if (err.status === 409) {
          this.showToast('El evento ya no está activo', 'error');
        } else {
          this.showToast('Error de conexión. Intentá de nuevo.', 'error');
        }
        this.cdr.detectChanges();
      },
    });
  }

  private showToast(text: string, kind: ToastKind): void {
    this.toastText = text;
    this.toastKind = kind;
    this.toastOpen = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastOpen = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  closeToast(): void {
    this.toastOpen = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}
