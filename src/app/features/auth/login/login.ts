import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputPasswordModule } from 'primeng/inputpassword';
import { ButtonDirective } from 'primeng/button';
import { LabelModule } from 'primeng/label';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth/auth';
import { AuthRequest } from '../../../core/auth/auth.models';
import { switchMap, finalize } from 'rxjs';

@Component({
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputPasswordModule,
    ButtonDirective,
    LabelModule,
    RouterLink
  ],
  selector: 'app-login',
  styles: ``,
  templateUrl: './login.html',
})
export class Login {

  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contraseña: ['', [Validators.required]]
  });

  login() {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const request:AuthRequest = this.form.getRawValue();

    this.auth.getCsrf().pipe(
      switchMap(()=>this.auth.login(request)),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next:() =>{
        void this.router.navigateByUrl('/inicio');
      },
      error: (error)=>{
        this.errorMessage.set(error.status === 0 ? 'No se pudo conectar con el backend.' : 'No se pudo iniciar sesión. Revisa las credenciales y la configuración CSRF.');
      }
    })
  }
}
