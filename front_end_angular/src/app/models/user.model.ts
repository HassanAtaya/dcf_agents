import { Role } from './role.model';

export interface AppUser {
  id?: number;
  username: string;
  password?: string;
  firstname: string;
  lastname: string;
  language: string;
  roles: Role[];
}

export interface UserDto {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  language: string;
  roleId: number | null;
}
