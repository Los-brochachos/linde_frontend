import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of, switchMap, catchError, tap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TrabajadorService } from '../../../../../core/services/trabajador/trabajador-service';
import { RolTrabajador, TrabajadorResponse, TrabajadorRegistro } from '../../../../../core/models/TrabajadorModel';

@Component({ selector: 'app-formulario-trabajador', imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule], templateUrl: './formulario.html' })
export class FormularioTrabajador {
  private readonly service = inject(TrabajadorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly modo = signal<'cerrado' | 'crear' | 'editar' | 'ver'>('cerrado');
  readonly seleccionado = signal<TrabajadorResponse | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');
  readonly roles: RolTrabajador[] = ['ADMIN', 'ANALISTA', 'PROGRAMADOR', 'CONDUCTOR', 'TECNICO'];
  readonly rolFormulario = signal<RolTrabajador>('ANALISTA');
  readonly campos = [
    { key: 'nombres', titulo: 'Nombres', tipo: 'text', max: 100, ayuda: 'Obligatorio, hasta 100 caracteres.' },
    { key: 'apellidos', titulo: 'Apellidos', tipo: 'text', max: 100, ayuda: 'Obligatorio, hasta 100 caracteres.' },
    { key: 'dni', titulo: 'DNI', tipo: 'text', max: 8, ayuda: 'Exactamente 8 dígitos.' },
    { key: 'telefono', titulo: 'Teléfono (opcional)', tipo: 'tel', max: 9, ayuda: 'Fijo de 8 dígitos o celular de 9, sin prefijo.' },
    { key: 'direccion', titulo: 'Dirección (opcional)', tipo: 'text', max: 150, ayuda: 'Hasta 150 caracteres.' },
    { key: 'fechaIngreso', titulo: 'Fecha de ingreso', tipo: 'date', max: 10, ayuda: 'Selecciona la fecha de ingreso.' },
  ];
  readonly extra: { key: string; titulo: string; tipo?: string; opciones?: string[]; roles: RolTrabajador[] }[] = [
    { key: 'licenciaConducir', titulo: 'Licencia de conducir', roles: ['CONDUCTOR'] },
    { key: 'categoriaLicencia', titulo: 'Categoría de licencia', opciones: ['A_I', 'A_IIA', 'A_IIB', 'A_IIIA', 'A_IIIB', 'A_IIIC'], roles: ['CONDUCTOR'] },
    { key: 'fechaVencimientoLicencia', titulo: 'Vencimiento de licencia', tipo: 'date', roles: ['CONDUCTOR'] },
    { key: 'turno', titulo: 'Turno', opciones: ['MAÑANA', 'TARDE', 'NOCHE'], roles: ['PROGRAMADOR'] },
    { key: 'nivelIngles', titulo: 'Nivel de inglés', opciones: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], roles: ['PROGRAMADOR'] },
    { key: 'especialidad', titulo: 'Especialidad', opciones: ['MECANICA_CISTERNAS', 'SISTEMAS_HIDRAULICOS', 'SISTEMAS_ELECTRICOS', 'MANTENIMIENTO_INDUSTRIAL', 'DIAGNOSTICO_VEHICULOS'], roles: ['TECNICO'] },
    { key: 'nivelTecnico', titulo: 'Nivel técnico', opciones: ['JUNIOR', 'SEMISENIOR', 'SENIOR'], roles: ['TECNICO'] },
  ];
  readonly form = this.fb.group({
    nombres: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    telefono: ['', Validators.pattern(/^(?:[1-8]\d{7}|9\d{8})?$/)],
    direccion: ['', Validators.maxLength(150)], fechaIngreso: ['', Validators.required],
    rol: this.fb.control<RolTrabajador>('ANALISTA', Validators.required),
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    contraseña: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    licenciaConducir: [''], categoriaLicencia: [''], fechaVencimientoLicencia: [''],
    turno: [''], nivelIngles: [''], especialidad: [''], nivelTecnico: [''],
  });

  constructor() {
    this.form.controls.rol.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(rol => {
      this.rolFormulario.set(rol); this.validarExtras();
    });
    combineLatest([this.route.data, this.route.paramMap]).pipe(
      tap(() => { this.cargando.set(true); this.errorCarga.set(''); this.errorFormulario.set(''); this.modo.set('cerrado'); }),
      switchMap(([data, params]) => {
        const modo = data['modoTrabajador'] as 'crear' | 'editar' | 'ver';
        if (modo === 'crear') { this.preparar('crear'); return of(null); }
        const id = Number(params.get('id'));
        if (!Number.isSafeInteger(id) || id < 1) { this.errorCarga.set('El identificador del trabajador no es válido.'); return of(null); }
        return this.service.buscar(id).pipe(tap(t => this.preparar(modo, t)), catchError(e => {
          this.errorCarga.set(e.status === 404 ? 'El trabajador no existe.' : 'No se pudieron consultar los datos del trabajador. Vuelve al listado e intenta nuevamente.'); return of(null);
        }));
      }), takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.cargando.set(false));
  }
  private validarExtras() {
    for (const campo of this.extra) {
      const control = this.form.get(campo.key)!;
      control.setValidators(this.modo() === 'crear' && campo.roles.includes(this.rolFormulario())
        ? [Validators.required, ...(campo.key === 'licenciaConducir' ? [Validators.maxLength(30)] : [])] : []);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }
  invalido(campo: string) { const c = this.form.get(campo); return !!c && c.touched && c.invalid; }

  preparar(modo: 'crear' | 'editar' | 'ver', trabajador: TrabajadorResponse | null = null) {
    if (this.guardando()) return;
 this.errorFormulario.set(''); this.seleccionado.set(trabajador); this.modo.set(modo);
    this.form.enable({ emitEvent: false }); this.form.reset({ rol: trabajador?.rol || 'ANALISTA' });
    this.rolFormulario.set(trabajador?.rol || 'ANALISTA');
    if (trabajador) this.form.patchValue({ ...trabajador, telefono: trabajador.telefono || '', direccion: trabajador.direccion || '' });
    if (modo !== 'crear') {
      this.form.controls.rol.disable(); this.form.controls.correo.disable(); this.form.controls.contraseña.disable();
    }
    this.validarExtras();
    if (modo === 'ver') this.form.disable();
  }

  cerrar() { if (!this.guardando()) void this.router.navigate(['/dashboard/trabajadores'], { queryParams: this.route.snapshot.queryParams }); }
  guardar() {
    if (this.guardando() || !['crear', 'editar'].includes(this.modo())) return;
    this.form.markAllAsTouched(); this.errorFormulario.set('');
    if (this.form.invalid) { this.errorFormulario.set('Revisa los campos obligatorios y sus formatos.'); return; }
    const v = this.form.getRawValue();
    if (this.modo() === 'crear' && new TextEncoder().encode(v.contraseña).length > 72) { this.errorFormulario.set('La contraseña no puede superar 72 bytes.'); return; }
    if (this.modo() === 'crear' && v.rol === 'CONDUCTOR' && v.fechaVencimientoLicencia <= new Date().toLocaleDateString('sv-SE')) {
      this.errorFormulario.set('El vencimiento de la licencia debe ser posterior a hoy.'); return;
    }
    const datos = { nombres: v.nombres.trim(), apellidos: v.apellidos.trim(), dni: v.dni, telefono: v.telefono, direccion: v.direccion.trim(), fechaIngreso: v.fechaIngreso };
    const request: TrabajadorRegistro = { ...datos, rol: v.rol, correo: v.correo.trim(), contraseña: v.contraseña };
    for (const campo of this.extra.filter(c => c.roles.includes(v.rol))) Object.assign(request, { [campo.key]: this.form.get(campo.key)!.value });
    const operacion = this.modo() === 'crear' ? this.service.crear(request) : this.service.actualizar(this.seleccionado()!.idTrabajador, datos);
    this.guardando.set(true);
    operacion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.guardando.set(false); void this.router.navigate(['/dashboard/trabajadores'], { queryParams: this.route.snapshot.queryParams, state: { trabajadorGuardado: true } }); },
      error: e => { this.guardando.set(false); this.errorFormulario.set(this.errorTexto(e)); },
    });
  }

  private errorTexto(e: { status: number; error?: { message?: string } }) {
    return e.status === 400 || e.status === 409 ? e.error?.message || 'Revisa los datos; podrían estar registrados.'
      : e.status === 403 ? 'Solo ADMIN puede gestionar trabajadores.' : e.status === 401 ? 'Tu sesión ha vencido.' : 'No se pudo confirmar la operación. Actualiza el listado antes de volver a intentarlo.';
  }
}
