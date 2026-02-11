export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  language: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse extends AuthUser {
  basicToken: string;
}
