export interface AuthRequest {
  correo: string;
  contraseña: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface CsrfResponse {
  token: string;
  headerName: string;
}