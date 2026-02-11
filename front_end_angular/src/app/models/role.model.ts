import { Permission } from './permission.model';

export interface Role {
  id?: number;
  name: string;
  permissions: Permission[];
}

export interface RoleDto {
  name: string;
  permissionIds: number[];
}
